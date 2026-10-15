import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Home, Mail, NotebookPen, CalendarClock, LifeBuoy, Menu, X } from "lucide-react";
import { Brand } from "./Logo";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/email", label: "Email Writer", icon: Mail },
  { to: "/meeting", label: "Meeting Notes", icon: NotebookPen },
  { to: "/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/help", label: "Help & Responsible AI", icon: LifeBuoy },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <Link
            to={to}
            onClick={onNavigate}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-foreground transition-colors hover:bg-lavender"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary", "aria-current": "page" }}
          >
            <Icon className="h-5 w-5" aria-hidden /> {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-card focus:p-2">
        Skip to content
      </a>
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/60 p-5 lg:block">
        <div className="sticky top-5">
          <Brand />
          <p className="mb-6 mt-1 pl-12 text-xs text-muted-foreground">Build confidence. Grow at work.</p>
          <nav aria-label="Main">
            <NavList />
          </nav>
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 hover:bg-lavender"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-b border-border bg-card p-4 lg:hidden">
          <NavList onNavigate={() => setOpen(false)} />
        </nav>
      )}

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
