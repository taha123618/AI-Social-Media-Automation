"use client";

import React, { useState, useRef } from "react";
import { loginAdmin } from "../actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, Mail, Lock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(logoRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })
      .from(cardRef.current, {
        y: 100,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power4.out"
      }, "-=0.4")
      .from(".form-item", {
        x: -20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
      }, "-=0.5");
  }, { scope: containerRef });

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await loginAdmin(formData);
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        // Shake animation on error
        gsap.to(cardRef.current, {
          x: 10,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          onComplete: () => { gsap.set(cardRef.current, { x: 0 }); }
        });
      }
    } catch (error: any) {
      if (error.message === "NEXT_REDIRECT" || error.digest?.includes("NEXT_REDIRECT")) {
        return;
      }
      toast.error("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0F19] px-4">
      {/* Premium Background Elements */}
      <div className="mesh-gradient absolute inset-0 opacity-40" />
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo Section */}
        <div ref={logoRef} className="mb-8 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-white sm:text-3xl">
              Social AI <span className="text-blue-500">Admin</span>
            </h1>
            <p className="text-sm text-slate-400">Secure Protocol Access</p>
          </div>
        </div>

        {/* Login Card */}
        <div ref={cardRef}>
          <Card className="glass-card premium-border overflow-hidden border-0 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold text-white">Login</CardTitle>
              <CardDescription className="text-slate-400">
                Authorized Personnel Only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-5" ref={formRef}>
                <div className="form-item space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@gmail.com"
                      required
                      className="h-11 border-slate-800 bg-slate-950/50 pl-10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div className="form-item space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="h-11 border-slate-800 bg-slate-950/50 pl-10 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="form-item pt-2"
                >
                  <Button
                    type="submit"
                    className="group relative h-11 w-full overflow-hidden bg-blue-600 font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    disabled={isLoading}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center"
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Decrypting...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="login"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          Access Control
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            System Identity: AI SOCIAL AUTOMATION v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
