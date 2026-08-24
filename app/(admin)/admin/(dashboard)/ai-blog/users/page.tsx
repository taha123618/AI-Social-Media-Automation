"use client";

import { useState, useEffect } from "react";
import {
  Search, Loader2, Users as UsersIcon, Ban, CheckCircle,
  AlertTriangle, MoreHorizontal,
} from "lucide-react";

interface BlogUser {
  id: string;
  name: string | null;
  email: string;
  totalArticles: number;
  totalWords: number;
  avgSeoScore: number;
  lastActivity: string;
  status: "active" | "suspended";
}

export default function AIBlogUsers() {
  const [users, setUsers] = useState<BlogUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/blog/users")
      .then((r) => r.json())
      .then((json) => { setUsers(json.users ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await fetch("/api/admin/blog/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: newStatus }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus as "active" | "suspended" } : u)),
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage blog writer users and usage.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground"
        />
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase">User</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase">Articles</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase">Words</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase">Avg SEO</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase">Last Activity</th>
                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase">Status</th>
                <th className="w-16 p-4" />
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="font-bold text-foreground">{user.name ?? "Unnamed"}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-foreground">{user.totalArticles}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.totalWords.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-sm font-bold ${user.avgSeoScore >= 70 ? "text-emerald-400" : user.avgSeoScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                      {user.avgSeoScore}%
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(user.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${
                      user.status === "active" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === "active" ? "bg-emerald-400" : "bg-red-400"
                      }`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.status === "active"
                          ? "hover:bg-red-500/10 text-red-400"
                          : "hover:bg-emerald-500/10 text-emerald-400"
                      }`}
                      title={user.status === "active" ? "Suspend user" : "Activate user"}
                    >
                      {user.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
