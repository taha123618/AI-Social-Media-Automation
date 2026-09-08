"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import AppLogo from "./AppLogo";
import { ModeToggle } from "../ui/ModeToggle";
import { useSession } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navItems = [
    { name: "Features", href: "/#features" },
    { name: "Tools", href: "/#tools" },
    { name: "Social Media", href: "/social-media-management-tool" },
    { name: "AI Blog", href: "/ai-blog-writer" },
    { name: "Pricing", href: "/pricing" },
    { name: "Talk to Sales", href: "/talk-to-sales" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("#") || href.startsWith("/#")) return false;
    return pathname === href;
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <nav
        className={`max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 relative ${
          scrolled
            ? "bg-background/85 border border-border/80 shadow-lg shadow-black/5 backdrop-blur-xl mx-4 lg:mx-auto"
            : "bg-background/60 border border-border/40 backdrop-blur-md mx-4 lg:mx-auto"
        }`}
      >
        <AppLogo />

        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative text-sm font-medium transition-colors tracking-tight flex items-center gap-1 ${
                isActive(item.href)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
              {isActive(item.href) && (
                <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="hidden lg:block text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {session ? "Dashboard" : "Log in"}
          </Link>
          {!session && (
            <Link href="/register">
              <Button size="sm" className="hidden sm:inline-flex rounded-lg px-4 font-semibold text-xs gap-1.5">
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 md:hidden text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 mt-3 bg-card/95 border border-border rounded-2xl overflow-hidden backdrop-blur-2xl shadow-2xl md:hidden z-40"
            >
              <div className="p-6 space-y-5">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-semibold transition-all ${
                        isActive(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:text-primary hover:bg-muted"
                      }`}
                    >
                      {isActive(item.href) && (
                        <span className="w-1.5 h-4 rounded-full bg-primary shrink-0" />
                      )}
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-4 border-t border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                    <ModeToggle />
                  </div>
                  <Link href={session ? "/dashboard" : "/login"} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-11 rounded-lg font-semibold">
                      {session ? "Dashboard" : "Log in"}
                    </Button>
                  </Link>
                  {!session && (
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full h-11 rounded-lg font-semibold">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
