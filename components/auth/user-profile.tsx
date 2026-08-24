"use client";

import { useSession, signOut } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import Logout from "../user/common/logout";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";

export function UserProfile() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  if (isPending) {
    return (
      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
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
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-200 dark:border-slate-700">
            {initials}
          </div>
        )}
        <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 z-20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  fill
                  preload
                    alt="Profile"
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {session.user.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`h-2 w-2 rounded-full ${session.user.emailVerified ? "bg-green-500" : "bg-yellow-500"}`} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {session.user.emailVerified ? "Verified" : "Not verified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
          <div className="p-2 flex flex-col gap-1 space-y-1.5">
            <Link href="/settings" className="w-full flex items-center justify-start gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Settings</span>
              </Link>

              <Logout />
            </div>
        </div>
      )}
    </div>
  );
}
