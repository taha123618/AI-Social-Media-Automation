/* eslint-disable @next/next/no-page-custom-font */
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AppLogo from "./AppLogo";

// Static constants hoisted outside of component scope to eliminate re-allocation overhead
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
const SCRAMBLE_DURATION = 1200; // ms
const SCRAMBLE_LOOP_INTERVAL = 6000; // ms

const SPRING_HOVER_TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 25,
} as const;

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly count?: string;
}

interface SocialItem {
  readonly label: string;
  readonly href: string;
}

const STATIC_NAV_LINKS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Works", href: "/social-media-management-tool", count: "[004]" },
  { label: "Our Studio", href: "/#features" },
  { label: "Blog", href: "/ai-blog-writer" },
  { label: "Contact", href: "/talk-to-sales" },
];

const STATIC_SOCIAL_LINKS: readonly SocialItem[] = [
  { label: "Twitter (X)", href: "https://x.com" },
  { label: "Linkedin", href: "https://linkedin.com" },
  { label: "Discord", href: "https://discord.gg" },
  { label: "Instagram", href: "https://instagram.com" },
];

interface ShuffleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

// Memoized ShuffleText component to prevent unnecessary re-evaluations during parent renders
const ShuffleText = React.memo(function ShuffleText({
  text,
  className,
  style,
}: ShuffleTextProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    let isCancelled = false;

    const runScramble = () => {
      startTime = null;

      const step = (timestamp: number) => {
        if (isCancelled) return;
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / SCRAMBLE_DURATION, 1);

        let scrambled = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") {
            scrambled += " ";
          } else if (progress > i / text.length) {
            scrambled += text[i];
          } else {
            scrambled +=
              SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
              ];
          }
        }

        setDisplayText(scrambled);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    runScramble();
    const intervalId = setInterval(runScramble, SCRAMBLE_LOOP_INTERVAL);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
    };
  }, [text]);

  return (
    <span className={className} style={style}>
      {displayText}
    </span>
  );
});

function FooterComponent() {
  const [time, setTime] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Stabilize real-time clock effect with strict lifecycle cleanup
  useEffect(() => {
    let isMounted = true;

    const updateClock = () => {
      if (!isMounted) return;
      try {
        const now = new Date();
        const melbourneTime = now.toLocaleTimeString("en-US", {
          timeZone: "Australia/Melbourne",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        setTime(melbourneTime);
      } catch {
        setTime("12:00 PM");
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Memoized submission handler
  const handleSubscribe = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      setSubmitted(true);
      const timer = setTimeout(() => {
        setEmail("");
        setSubmitted(false);
      }, 4000);

      return () => clearTimeout(timer);
    },
    [email]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );

  // Memoized navigation and social lists
  const navLinks = useMemo(() => STATIC_NAV_LINKS, []);
  const socialLinks = useMemo(() => STATIC_SOCIAL_LINKS, []);

  return (
    <>
      {/* Scoped Google Font: Barlow Condensed */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&display=swap"
        rel="stylesheet"
        crossOrigin="anonymous"
      />

      <style>{`
        [data-footer-condensed] {
          font-family: 'Barlow Condensed', sans-serif;
        }
      `}</style>

      <footer
        className="w-full bg-card text-card-foreground overflow-hidden select-none border-t border-border/80 transition-colors duration-300"
        style={{ fontFamily: "sans-serif" }}
      >
        {/* Section 1 — Top footer grid */}
        <div className="px-6 md:px-10 pt-20 pb-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Column 1 — Logo & Email */}
            <div className="flex flex-col justify-between">
              {/* Inline Geometric Chevron SVG Mark */}
              {/* <div>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-6"
                >
                  <path
                    d="M8 10L20 32L32 10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  />
                  <path
                    d="M13 10L20 25L27 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-foreground"
                  />
                </svg>
                <div className="text-[13px] font-mono text-foreground uppercase tracking-widest font-semibold">
                  SOCIAL AI STUDIO
                </div>
              </div> */}

              <AppLogo />

              {/* Email contact block */}
              <div className="mt-12 md:mt-0">
                <div className="text-[11px] text-muted-foreground tracking-[0.1em] mb-2 font-mono uppercase">
                  {"// SHOOT US AN EMAIL"}
                </div>
                <a
                  href="mailto:hello@socialai.io"
                  className="text-[15px] text-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  hello@socialai.io
                </a>
              </div>
            </div>

            {/* Column 2 — Navigation */}
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 bg-primary shrink-0" />
                <span className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase font-mono">
                  Navigation
                </span>
              </div>

              {/* Stacked Links */}
              <div className="flex flex-col gap-1" data-footer-condensed>
                {navLinks.map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ x: 10 }}
                    transition={SPRING_HOVER_TRANSITION}
                  >
                    <Link
                      href={item.href}
                      className="text-[32px] md:text-[42px] font-medium leading-[1.1] uppercase text-foreground hover:text-primary transition-colors inline-flex items-baseline"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      <span>{item.label}</span>
                      {item.count && (
                        <span className="text-[18px] text-muted-foreground/70 font-normal lowercase tracking-tight ml-2">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 3 — Socials */}
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 bg-primary shrink-0" />
                <span className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase font-mono">
                  Socials
                </span>
              </div>

              {/* Stacked Links */}
              <div className="flex flex-col gap-1" data-footer-condensed>
                {socialLinks.map((social) => (
                  <motion.div
                    key={social.label}
                    whileHover={{ x: 10 }}
                    transition={SPRING_HOVER_TRANSITION}
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[32px] md:text-[42px] font-medium leading-[1.1] uppercase text-foreground hover:text-primary transition-colors inline-block"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {social.label}
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 4 — Empty Spacer */}
            <div className="hidden md:block" />
          </div>
        </div>

        {/* Section 2 — Newsletter row */}
        <div className="px-6 md:px-10 pb-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 items-end">
            {/* Col A */}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary shrink-0" />
              <span className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase font-mono">
                Newsletter
              </span>
            </div>

            {/* Col B */}
            <div>
              <p className="text-[11px] text-muted-foreground tracking-[0.1em] uppercase font-mono">
                {"// Receive updates and news from us"}
              </p>
            </div>

            {/* Col C */}
            <div className="md:col-span-2">
              <form
                onSubmit={handleSubscribe}
                className="border-b border-border/80 pb-2 focus-within:border-primary transition-colors duration-300 flex items-center justify-between gap-4"
              >
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={
                    submitted
                      ? "Thank you for subscribing!"
                      : "Your email address"
                  }
                  required
                  className="bg-transparent text-[14px] py-2 placeholder:text-muted-foreground/60 text-foreground focus:outline-none w-full font-mono"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground font-bold text-[12px] tracking-[0.1em] uppercase px-6 py-2.5 relative cursor-pointer hover:bg-primary/90 transition-all duration-200 active:scale-95 shrink-0 flex items-center gap-2"
                >
                  <span>{submitted ? "Joined" : "Submit"}</span>
                  <span className="w-1.5 h-1.5 bg-primary-foreground inline-block" />
                  {/* Absolute dashed outline overlay */}
                  <div className="absolute -inset-1 border border-dashed border-primary/40 pointer-events-none" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Section 3 — Brand block */}
        <div className="px-6 md:px-10 max-w-7xl mx-auto">
          <div className="border border-border/80 relative overflow-hidden bg-card/60 backdrop-blur-sm">
            {/* Corner Brackets */}
            <div className="w-5 h-5 border-t-2 border-l-2 border-foreground/30 absolute top-0 left-0 pointer-events-none" />
            <div className="w-5 h-5 border-t-2 border-r-2 border-foreground/30 absolute top-0 right-0 pointer-events-none" />
            <div className="w-5 h-5 border-b-2 border-l-2 border-foreground/30 absolute bottom-0 left-0 pointer-events-none" />
            <div className="w-5 h-5 border-b-2 border-r-2 border-foreground/30 absolute bottom-0 right-0 pointer-events-none" />

            {/* Location & Live Clock Bar */}
            {/* <div className="py-4 border-b border-border/60 text-center text-[10px] md:text-[11px] text-muted-foreground tracking-[0.15em] font-mono uppercase px-4">
              Located in Australia &amp; Japan, working globally. // 37.8136° S,
              144.9631° E //{" "}
              <span className="text-foreground font-semibold">
                {time || "12:00 PM"}
              </span>
            </div> */}

            {/* Massive Brand Word with ShuffleText scramble */}
            <div
              className="py-10 px-4 flex justify-center items-center overflow-hidden min-h-[160px] md:min-h-[400px]"
              data-footer-condensed
            >
              <ShuffleText
                text="SOCIAL AI"
                className="font-bold text-foreground/80 text-[120px] sm:text-[180px] md:text-[420px] leading-[0.8] tracking-[-0.05em] whitespace-nowrap uppercase font-['Barlow_Condensed',sans-serif]"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              />
            </div>
          </div>
        </div>

        {/* Section 4 — Bottom bar */}
        <div className="mt-8 border-t border-dashed border-border/80">
          <div className="px-6 md:px-10 py-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left Copyright */}
            <div className="text-[11px] text-muted-foreground tracking-[0.08em] uppercase font-mono">
              ©2026 SOCIAL AI™ // All Rights Reserved
            </div>

            {/* Right Links */}
            <div className="flex gap-8 text-[12px] font-mono tracking-wider">
              <span className="text-muted-foreground">
                We respect your{" "}
                <Link
                  href="/privacy"
                  className="text-foreground underline decoration-primary hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
              </span>
              <span className="text-muted-foreground">
                Brand by{" "}
                <Link
                  href="/"
                  className="text-foreground underline decoration-primary decoration-1 hover:text-primary transition-colors"
                >
                  SocialAI
                </Link>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// Export top-level memoized Footer to avoid unnecessary re-renders in parent layouts
export default React.memo(FooterComponent);
