"use client";

import { useSession, signOut } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useHasHydrated } from "@/hooks/use-has-hydrated";

export function UserProfile() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasHydrated = useHasHydrated();

  useClickOutside(dropdownRef, () => setIsOpen(false));

  if (!hasHydrated || isPending) {
    return (
      <div
        suppressHydrationWarning
        className="h-8 w-8 rounded-none bg-secondary border border-border animate-pulse"
      />
    );
  }

  if (!session) {
    return (
      <div
        suppressHydrationWarning
        className="h-8 w-8 rounded-none bg-secondary border border-border flex items-center justify-center"
      >
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const initials = session.user.name
    ? session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : session.user.email?.slice(0, 2).toUpperCase() || "OP";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2.5 p-1 rounded-none border border-transparent hover:border-border hover:bg-secondary/60 transition-none"
      >
        {session.user.image ? (
          <div className="relative w-7 h-7 rounded-none overflow-hidden border border-border">
            <Image
              src={session.user.image}
              sizes="28px"
              fill
              alt="Profile"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-none bg-primary text-primary-foreground border border-primary flex items-center justify-center font-mono font-bold text-[11px] shadow-none">
            {initials}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-xs font-bold text-foreground leading-tight truncate max-w-[110px]">
            {session.user.name || "Operator"}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[110px]">
            {session.user.email}
          </p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 bg-popover rounded-none shadow-none border border-border p-1 z-50 transition-none">
          <div className="px-3 py-2 border-b border-border md:hidden">
            <p className="text-xs font-bold text-foreground">
              {session.user.name || "Operator"}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground truncate">
              {session.user.email}
            </p>
          </div>

          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-secondary rounded-none font-medium transition-none"
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Settings</span>
          </Link>

          <div className="border-t border-border my-1" />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-none font-medium transition-none"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
