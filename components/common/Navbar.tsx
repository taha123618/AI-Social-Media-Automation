"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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
    if (href.startsWith("#") || href.startsWith("/#")) return false;
    return pathname === href;
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <nav
        className={`max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-none transition-all duration-300 relative ${
          scrolled
            ? "bg-card/90 border border-border shadow-none backdrop-blur-xl mx-4 lg:mx-auto"
            : "bg-card/40 border border-border backdrop-blur-sm mx-4 lg:mx-auto"
        }`}
      >
        <AppLogo />

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-xs font-mono font-bold uppercase tracking-wider transition-none ${
                isActive(item.href)
                  ? "text-primary border-b-2 border-primary pb-0.5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="text-xs font-mono font-bold uppercase text-muted-foreground hover:text-foreground transition-none"
          >
            {session ? "CONSOLE" : "OPERATOR LOG IN"}
          </Link>
          {!session && (
            <Link href="/register">
              <Button size="sm" className="font-mono text-xs uppercase rounded-none">
                DEPLOY FLEET
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 md:hidden text-foreground hover:bg-secondary border border-border rounded-none transition-none"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-none md:hidden z-40 p-4 space-y-4 rounded-none">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`p-2 text-xs font-mono font-bold uppercase rounded-none ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link href={session ? "/dashboard" : "/login"} onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full rounded-none">
                  {session ? "OPERATIONAL CONSOLE" : "OPERATOR LOG IN"}
                </Button>
              </Link>
              {!session && (
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full rounded-none">
                    INITIALIZE FLEET
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </motion.header>
  );
}
