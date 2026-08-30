import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Briefcase,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Jobs", to: "/admin/jobs", icon: Briefcase, exact: false },
  { label: "Job Applies", to: "/admin/job-applies", icon: ClipboardCheck, exact: false },
  { label: "Applications", to: "/admin/applications", icon: Users, exact: false },

  { label: "Exam Creator", to: "/admin/exams", icon: ClipboardList, exact: false },
  { label: "Forms", to: "/admin/forms", icon: FileText, exact: false },
  { label: "Settings", to: "/admin/settings", icon: Settings, exact: false },
  { label: "Profile", to: "/admin/profile", icon: UserRound, exact: false },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center px-6">
        <span className="text-lg font-bold tracking-tight text-sidebar-accent-foreground">
          NEXUS<span className="text-sidebar-primary">TALENT</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4" aria-hidden="true" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64">{sidebar}</div>
          <button
            type="button"
            aria-label="Close menu"
            className="flex-1 bg-primary/40"
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-primary/5 bg-background/90 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open admin menu"
                className="rounded-lg border border-primary/10 p-2 lg:hidden"
              >
                <Menu className="size-4" aria-hidden="true" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-primary">{title}</h1>
                {description ? (
                  <p className="text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    active: "bg-success/10 text-success",
    selected: "bg-success/10 text-success",
    draft: "bg-warning/15 text-warning-foreground",
    new: "bg-accent/10 text-accent",
    under_review: "bg-accent/10 text-accent",
    shortlisted: "bg-accent/10 text-accent",
    interview: "bg-warning/15 text-warning-foreground",
    closed: "bg-muted text-muted-foreground",
    archived: "bg-muted text-muted-foreground",
    rejected: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
        tone[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/15 bg-card p-12 text-center">
      <p className="font-semibold text-primary">{title}</p>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-xl bg-card" />
      ))}
    </div>
  );
}
