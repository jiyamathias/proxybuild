"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, FolderOpen, Users, ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SearchResults = {
  projects: { id: string; title: string; status: string; city: string | null }[];
  clients: { id: string; email: string; firstName: string | null; lastName: string | null }[];
  consultations: { id: string; firstName: string; lastName: string; email: string; status: string }[];
};

export function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasResults = results && (
    results.projects.length > 0 || results.clients.length > 0 || results.consultations.length > 0
  );

  const close = () => { setOpen(false); setQuery(""); };

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--pb-text-subtle)] pointer-events-none" />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--pb-text-subtle)] animate-spin" />
      )}
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && hasResults && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
        }}
        placeholder="Search projects, clients…"
        className="w-full h-9 bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] rounded-lg pl-9 pr-4 text-sm text-white placeholder:text-[var(--pb-text-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--pb-green)] focus:border-[var(--pb-green)]"
      />

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-xl shadow-xl z-50 overflow-hidden">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-[var(--pb-text-muted)]">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--pb-border)]">

              {results.projects.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--pb-text-subtle)]">
                    Projects
                  </p>
                  {results.projects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/projects/${p.id}`}
                      onClick={close}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--pb-surface-elevated)] transition-colors"
                    >
                      <FolderOpen className="h-4 w-4 text-[var(--pb-green)] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{p.title}</p>
                        <p className="text-xs text-[var(--pb-text-subtle)]">{p.city ?? ""} · {p.status.replace(/_/g, " ")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.clients.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--pb-text-subtle)]">
                    Clients
                  </p>
                  {results.clients.map((c) => (
                    <Link
                      key={c.id}
                      href={`/admin/clients/${c.id}`}
                      onClick={close}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--pb-surface-elevated)] transition-colors"
                    >
                      <Users className="h-4 w-4 text-[var(--pb-green)] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.email}
                        </p>
                        <p className="text-xs text-[var(--pb-text-subtle)] truncate">{c.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.consultations.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--pb-text-subtle)]">
                    Consultations
                  </p>
                  {results.consultations.map((c) => (
                    <Link
                      key={c.id}
                      href={`/admin/consultations/${c.id}`}
                      onClick={close}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--pb-surface-elevated)] transition-colors"
                    >
                      <ClipboardList className="h-4 w-4 text-[var(--pb-green)] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-[var(--pb-text-subtle)] truncate">{c.email} · {c.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
