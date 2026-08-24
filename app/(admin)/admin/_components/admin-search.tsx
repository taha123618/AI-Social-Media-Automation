"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search, User, Shield, Building2, Loader2, Sparkles, History, ArrowRight } from "lucide-react";
import { globalSearch } from "../actions/admin.actions";
import { useDebounce } from "react-use";

// Highlighting component for Algolia feel
const Highlight = ({ text, term }: { text: string; term: string }) => {
  if (!term.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${term})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-primary font-bold rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export function AdminSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<{
    admins: any[];
    users: any[];
    organizations: any[];
  }>({ admins: [], users: [], organizations: [] });
  const router = useRouter();

  React.useEffect(() => {
    const saved = localStorage.getItem("recent-admin-searches");
    if (saved) setRecentSearches(JSON.parse(saved));

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useDebounce(
    () => {
      if (query.length >= 2) {
        setLoading(true);
        globalSearch(query)
          .then((res) => setResults(res))
          .finally(() => setLoading(false));
      } else {
        setResults({ admins: [], users: [], organizations: [] });
      }
    },
    200, // Faster debounce for Algolia feel
    [query]
  );

  const onSelect = (path: string, term?: string) => {
    if (term) {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recent-admin-searches", JSON.stringify(updated));
    }
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex w-full max-w-[300px] items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:shadow-2xl hover:scale-[1.02] sm:max-w-md backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary animate-pulse" />
          <span className="font-bold tracking-tight">Global Search Engine...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded-md border border-border bg-muted/80 px-1.5 font-mono text-[10px] font-black text-muted-foreground group-hover:text-primary sm:flex transition-colors">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-background/95 backdrop-blur-xl text-foreground border-border p-3">
          <div className="flex items-center gap-2 px-3 border-b border-border/50 pb-2">
            <Sparkles className="h-5 w-5 text-primary animate-sparkle" />
            <CommandInput
              placeholder="Instant find admins, users, or workflows..."
              value={query}
              onValueChange={setQuery}
              className="flex-1 border-none focus:ring-0 text-lg font-black tracking-tight placeholder:text-muted-foreground/50"
            />
          </div>
          <CommandList className="max-h-[70vh] scrollbar-hide py-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Scanning Neural Cache</p>
              </div>
            )}

            {!loading && query.length === 0 && recentSearches.length > 0 && (
              <CommandGroup heading="Recent Neural Activity" className="px-2">
                {recentSearches.map((s) => (
                  <CommandItem
                    key={s}
                    onSelect={() => setQuery(s)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted/50 group"
                  >
                    <History className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="font-bold text-foreground/80 group-hover:text-foreground">{s}</span>
                    <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!loading && query.length > 0 && results.admins.length === 0 && results.users.length === 0 && results.organizations.length === 0 && (
              <CommandEmpty className="py-20 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-muted/50">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-foreground">No Directives Found</p>
                    <p className="text-sm font-medium text-muted-foreground">Adjust your query constraints for better matching.</p>
                  </div>
                </div>
              </CommandEmpty>
            )}

            {results.admins.length > 0 && (
              <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Administrative Nodes</span>} className="px-2">
                {results.admins.map((admin) => (
                  <CommandItem
                    key={admin.id}
                    onSelect={() => onSelect(`/admin/admins/edit/${admin.id}`, query)}
                    className="flex items-center gap-4 p-4 aria-selected:bg-primary/10 cursor-pointer rounded-2xl transition-all border border-transparent aria-selected:border-primary/20 group translate-z-0"
                  >
                    <div className="rounded-xl bg-blue-500/10 p-2.5 shadow-inner">
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-foreground group-aria-selected:text-primary transition-colors">
                        <Highlight text={admin.name} term={query} />
                      </p>
                      <p className="text-xs font-bold text-muted-foreground">
                        <Highlight text={admin.email} term={query} />
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/40 bg-primary/5 px-2 py-1 rounded-md opacity-0 group-aria-selected:opacity-100 transition-opacity">Access Level: {admin.role}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.users.length > 0 && (
              <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">Identity Matrix</span>} className="px-2 mt-4">
                {results.users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => onSelect(`/admin/users/${user.id}`, query)}
                    className="flex items-center gap-4 p-4 aria-selected:bg-emerald-500/10 cursor-pointer rounded-2xl transition-all border border-transparent aria-selected:border-emerald-500/20 group"
                  >
                    <div className="rounded-xl bg-emerald-500/10 p-2.5 shadow-inner">
                      <User className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-foreground group-aria-selected:text-emerald-500 transition-colors">
                        <Highlight text={user.name} term={query} />
                      </p>
                      <p className="text-xs font-bold text-muted-foreground">
                        <Highlight text={user.email} term={query} />
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-emerald-500 opacity-0 group-aria-selected:opacity-100 translate-x-2 group-aria-selected:translate-x-0 transition-all" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.organizations.length > 0 && (
              <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500/70">Organizational Clusters</span>} className="px-2 mt-4">
                {results.organizations.map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => onSelect(`/admin/organizations/${org.id}`, query)}
                    className="flex items-center gap-4 p-4 aria-selected:bg-purple-500/10 cursor-pointer rounded-2xl transition-all border border-transparent aria-selected:border-purple-500/20 group"
                  >
                    <div className="rounded-xl bg-purple-500/10 p-2.5 shadow-inner">
                      <Building2 className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-foreground group-aria-selected:text-purple-500 transition-colors">
                        <Highlight text={org.name} term={query} />
                      </p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                        <Highlight text={org.slug} term={query} />
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-purple-500/5 px-2 py-1 rounded-md opacity-0 group-aria-selected:opacity-100 transition-opacity">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Active Cluster</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator className="bg-border/50 my-6" />
            <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Protocol Navigation</span>} className="px-2">
              <CommandItem onSelect={() => onSelect("/admin/dashboard")} className="aria-selected:bg-muted/80 rounded-xl cursor-pointer p-4 font-black transition-all flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                OVERVIEW DASHBOARD
              </CommandItem>
              <CommandItem onSelect={() => onSelect("/admin/analytics")} className="aria-selected:bg-muted/80 rounded-xl cursor-pointer p-4 font-black transition-all flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                TELEMETRY ANALYTICS
              </CommandItem>
              <CommandItem onSelect={() => onSelect("/admin/admins")} className="aria-selected:bg-muted/80 rounded-xl cursor-pointer p-4 font-black transition-all flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                ADMINISTRATIVE MATRIX
              </CommandItem>
              <CommandItem onSelect={() => onSelect("/admin/settings")} className="aria-selected:bg-muted/80 rounded-xl cursor-pointer p-4 font-black transition-all flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                PROTOCOL SETTINGS
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}
