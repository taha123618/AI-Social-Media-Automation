"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleAuthButton } from "./google-auth-button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

type RegisterStep = "CREDENTIALS" | "OTP_VERIFY";

export function RegisterForm() {
  const [step, setStep] = useState<RegisterStep>("CREDENTIALS");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State (6 digits)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timers and UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [expiresInSeconds, setExpiresInSeconds] = useState(120); // 2 minutes
  const [error, setError] = useState("");
  const [shakeError, setShakeError] = useState(false);
  const router = useRouter();

  // Password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength();
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  // Expiry & Resend cooldown timers when in OTP step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "OTP_VERIFY") {
      interval = setInterval(() => {
        setExpiresInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Focus first input on entering OTP step
  useEffect(() => {
    if (step === "OTP_VERIFY") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Handle Initial Registration -> Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please ensure both passwords match.");
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification code");
        toast.error(data.error || "Failed to send verification code");
        return;
      }

      toast.success("Security code sent! Please check your email.");
      setStep("OTP_VERIFY");
      setResendCooldown(60);
      setExpiresInSeconds(120);
      setOtp(["", "", "", "", "", ""]);
    } catch (err: unknown) {
      console.error("Error sending OTP:", err);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste in single box
      handleOtpPaste(value);
      return;
    }

    const cleanVal = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-advance to next box
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (cleanVal && index === 5 && newOtp.every((digit) => digit !== "")) {
      executeVerifyOtp(newOtp.join(""));
    }
  };

  // Handle Backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle Full Paste (e.g., copied "492019")
  const handleOtpPaste = (pastedText: string) => {
    const digits = pastedText.replace(/[^0-9]/g, "").slice(0, 6).split("");
    if (digits.length === 0) return;

    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(digits.length, 5);
    otpInputsRef.current[nextIndex]?.focus();

    if (digits.length === 6) {
      executeVerifyOtp(digits.join(""));
    }
  };

  // Execute OTP Verification & Account Activation
  const executeVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          otp: code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setShakeError(true);
        setTimeout(() => setShakeError(false), 600);
        setError(data.error || "Invalid verification code");
        toast.error(data.error || "Invalid verification code");
        setOtp(["", "", "", "", "", ""]);
        otpInputsRef.current[0]?.focus();
        return;
      }

      toast.success("🎉 Email verified! Activating workspace session...");

      // Automatically sign the user in with Better Auth client
      try {
        const loginRes = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        });

        if (loginRes.error) {
          router.push("/login?verified=true");
        } else {
          toast.success("Account successfully verified!");
          router.push("/dashboard");
        }
      } catch {
        router.push("/login?verified=true");
      }
    } catch (err: unknown) {
      console.error("Error verifying OTP:", err);
      setError("Failed to verify code. Please try again.");
      toast.error("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to resend code");
        setError(data.error || "Failed to resend code");
        return;
      }

      toast.success("A fresh 6-digit security code has been sent.");
      setResendCooldown(60);
      setExpiresInSeconds(120);
      setOtp(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } catch {
      toast.error("Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "CREDENTIALS" ? (
          <motion.div
            key="credentials-step"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Google OAuth Button First */}
            <GoogleAuthButton text="Sign up with Google" />

            {/* Separator */}
            <div className="relative my-6">
              <div className="border-t border-border" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
                or
              </span>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2 text-left">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Work Email */}
              <div className="space-y-2 text-left">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Work Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jane@company.com"
                  className="h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  {password && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Strength:{" "}
                      <span className="font-semibold text-foreground">
                        {strengthLabels[passwordScore]}
                      </span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    className="h-11 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Progress Bar */}
                {password.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 transition-all duration-300 ${passwordScore >= level
                            ? strengthColors[passwordScore]
                            : "bg-transparent"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                      <span className={password.length >= 8 ? "text-emerald-500 font-semibold" : ""}>
                        • 8+ chars
                      </span>
                      <span className={/[A-Z]/.test(password) ? "text-emerald-500 font-semibold" : ""}>
                        • Uppercase
                      </span>
                      <span className={/[0-9]/.test(password) ? "text-emerald-500 font-semibold" : ""}>
                        • Number
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  {confirmPassword && (
                    <span className={`text-[11px] font-medium transition-colors ${
                      password === confirmPassword
                        ? "text-emerald-500 font-semibold"
                        : "text-destructive"
                    }`}>
                      {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`h-11 pr-10 focus:ring-2 transition-all duration-200 ${
                      confirmPassword && password !== confirmPassword
                        ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                        : "focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit / Continue Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg mt-2 transition-colors duration-200 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating workspace...</span>
                  </div>
                ) : (
                  "Create workspace account"
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center mt-3 leading-normal">
                By creating an account, you agree to SocialAI&apos;s{" "}
                <a href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </a>{" "}
                and Terms.
              </p>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Header / 2FA Badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 text-primary mb-1 shadow-inner">
                <KeyRound className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Two-Factor Security Code
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                We sent a 6-digit one-time code to{" "}
                <strong className="text-foreground font-semibold">{email}</strong>
              </p>
            </div>

            {/* 6-Digit OTP Segmented Boxes */}
            <div
              className={`flex justify-center items-center gap-1.5 sm:gap-2.5 my-4 transition-transform ${
                shakeError ? "animate-shake" : ""
              }`}
              onPaste={(e) => {
                e.preventDefault();
                handleOtpPaste(e.clipboardData.getData("text"));
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={isLoading}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-lg sm:rounded-xl border bg-background/70 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                    digit
                      ? "border-primary/80 bg-primary/5 text-foreground shadow-primary/10"
                      : "border-border/80 text-foreground"
                  }`}
                />
              ))}
            </div>

            {/* Expiry Countdown & Resend Option */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className={`w-2 h-2 rounded-full ${expiresInSeconds > 60 ? "bg-emerald-500 animate-pulse" : "bg-red-500 animate-ping"
                    }`}
                />
                <span>
                  Expires in{" "}
                  <strong className="text-foreground font-mono">
                    {formatTime(expiresInSeconds)}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending || isLoading}
                className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Verify Button */}
            <Button
              type="button"
              onClick={() => executeVerifyOtp()}
              disabled={isLoading || otp.some((d) => !d)}
              className="w-full h-11 rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Activate Workspace
                </span>
              )}
            </Button>

            {/* Back to Edit Credentials Link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep("CREDENTIALS");
                  setError("");
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Wrong email address? Edit details</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
