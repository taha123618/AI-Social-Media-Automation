"use client";

import { useSession, signOut } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import Logout from "../user/common/logout";
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
        className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"
      />
    );
  }

  if (!session) {
    return (
      <div
        suppressHydrationWarning
        className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
      >
        <User className="h-5 w-5 text-slate-500" />
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
    : session.user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-3 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            sizes="(max-width: 1024px) 100vw, 70vw"
            fill
            preload
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {initials}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            {session.user.name || "User"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
            {session.user.email}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500 hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 md:hidden">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {session.user.name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {session.user.email}
            </p>
          </div>

          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>

          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
