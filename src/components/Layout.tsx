import type { ReactNode } from "react";

const tabs = [
  ["play", "Play"],
  ["leaderboards", "History"],
  ["admin-users", "People"],
  ["admin-groups", "Groups"],
  ["admin-import", "Import"],
  ["settings", "Settings"]
] as const;

export function Layout({ page, onPageChange, children }: { page: string; onPageChange: (page: string) => void; children: ReactNode }) {
  return (
    <div className="app-shell">
      <header>
        <div className="title-block">
          <h1>🎯 Wheel of Opportunity</h1>
          <p className="tagline">Every voice. Every turn. No favorites.</p>
        </div>
        <nav>
          {tabs.map(([key, label]) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => onPageChange(key)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
