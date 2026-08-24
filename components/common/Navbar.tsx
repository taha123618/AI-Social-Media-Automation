"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import AppLogo from "./AppLogo";
import { ModeToggle } from "../ui/ModeToggle";
import { useSession } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "Features", href: "/#features" },
    { name: "Tools", href: "/#tools" },
    { name: "Social Media", href: "/social-media-management-tool" },
    { name: "AI Blog", href: "/ai-blog-writer" },
    { name: "Pricing", href: "/pricing" },
    { name: "Talk to Sales", href: "/talk-to-sales" },
  ];

  const isActive = (href: string) => {
    // Only match real page routes, not hash anchors
    if (href.startsWith("#") || href.startsWith("/#")) return false;
    return pathname === href;
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-4" : "py-6"
        }`}
    >
      <nav className={`max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 relative ${scrolled
        ? "bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-xl mx-4 lg:mx-auto"
        : "bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/10 backdrop-blur-sm mx-4 lg:mx-auto"
        }`}>
        <AppLogo />

        <div className="hidden md:flex items-center gap-8">
          {navItems?.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative text-sm font-bold transition-colors tracking-tight flex items-center gap-1 ${isActive(item.href)
                ? "text-[#2D46FF] dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-[#2D46FF] dark:hover:text-blue-400"
                }`}
            >
              {item.name}
              {isActive(item.href) && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#2D46FF] dark:bg-blue-400" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
          <Link href={session ? "/dashboard" : "/login"} className="hidden lg:block text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">
            {session ? "Dashboard" : "Log in"}
          </Link>
          {!session && (
            <Link href="/register">
              <Button className="hidden sm:flex bg-[#2D46FF] hover:bg-[#1E35E0] text-white rounded-xl px-6 py-6 font-black text-sm shadow-xl shadow-blue-200 dark:shadow-none active:scale-95 transition-all">
                Get Started
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 mt-4 mx-0 bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl md:hidden z-40"
            >
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  {navItems?.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xl font-black transition-all ${isActive(item.href)
                        ? "text-[#2D46FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-slate-900 dark:text-white hover:text-[#2D46FF] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                    >
                      {isActive(item.href) && (
                        <span className="w-1 h-6 rounded-full bg-[#2D46FF] dark:bg-blue-400 shrink-0" />
                      )}
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Appearance</span>
                    <ModeToggle />
                  </div>
                  <Link href={session ? "/dashboard" : "/login"} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-lg">
                      {session ? "Dashboard" : "Log in"}
                    </Button>
                  </Link>
                  {!session && (
                    <Link href="/register">
                      <Button className="w-full h-14 rounded-2xl bg-[#2D46FF] text-white font-black text-lg shadow-xl shadow-blue-200 dark:shadow-none">
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Branded Accent in mobile menu */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
