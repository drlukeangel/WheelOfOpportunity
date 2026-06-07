import type { ReactNode } from "react";

const tabs = [
  ["play", "Play"],
  ["leaderboards", "Leaderboards"],
  ["admin-users", "Admin Users"],
  ["admin-groups", "Admin Groups"],
  ["admin-import", "Import"],
  ["settings", "Settings"]
] as const;

export function Layout({ page, onPageChange, children }: { page: string; onPageChange: (page: string) => void; children: ReactNode }) {
  return (
    <div className="app-shell">
      <header>
        <h1>🎯 Strategy Picker Arcade</h1>
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
