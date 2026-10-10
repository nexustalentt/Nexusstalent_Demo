import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Briefcase,
  ClipboardCheck,
  ClipboardList,
  ExternalLink,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { NexusLogo, NexusLogoNavIcon } from "@/components/brand/nexus-logo";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", to: "/admin/products", icon: Package, exact: false },
  { label: "Jobs", to: "/admin/jobs", icon: Briefcase, exact: false },
  { label: "Job Applies", to: "/admin/job-applies", icon: NexusLogoNavIcon, exact: false },
  { label: "Referrals", to: "/admin/referrals", icon: UserPlus, exact: false },
  { label: "Applications", to: "/admin/applications", icon: Users, exact: false },

  { label: "Exam Creator", to: "/admin/exams", icon: ClipboardList, exact: false },
  { label: "Forms", to: "/admin/forms", icon: FileText, exact: false },
  { label: "ZOZII control", href: "https://zozii-iota.vercel.app/", icon: Globe, external: true },
  { label: "Settings", to: "/admin/settings", icon: Settings, exact: false },
  { label: "Profile", to: "/admin/profile", icon: UserRound, exact: false },
] as const;

function isExternalNavItem(
  item: (typeof navItems)[number],
): item is Extract<(typeof navItems)[number], { external: true }> {
  return "external" in item && item.external === true;
}

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
    <div className="flex h-full flex-col bg-[#161616] text-[#f4f4f4]">
      <div className="flex h-16 items-center gap-3 border-b border-[#262626] px-5">
        <Link to="/admin" className="flex items-center gap-2.5">
          <NexusLogo size={30} className="rounded-none shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white">
              <span className="text-[#d4af37]">NEXUS</span>{" "}
              <span className="text-[#0f62fe]">TALENT</span>
            </span>
            <span className="font-mono text-[9px] text-[#8d8d8d] tracking-widest uppercase">
              Admin Suite
            </span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 py-3">
        {navItems.map((item) => {
          if (isExternalNavItem(item)) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-[#c6c6c6] transition-colors hover:bg-[#262626] hover:text-white"
              >
                <item.icon className="size-4 shrink-0 text-[#8d8d8d]" aria-hidden="true" />
                <span>{item.label}</span>
                <ExternalLink className="ml-auto size-3 opacity-60" aria-hidden="true" />
              </a>
            );
          }

          const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-l-4 border-[#0f62fe] bg-[#262626] pl-4 text-white font-semibold"
                  : "border-l-4 border-transparent text-[#c6c6c6] hover:bg-[#262626] hover:text-white"
              }`}
            >
              <item.icon className={`size-4 shrink-0 ${isActive ? "text-[#0f62fe]" : "text-[#8d8d8d]"}`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#262626] p-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-5 py-2.5 text-xs font-medium text-[#c6c6c6] transition-colors hover:bg-[#262626] hover:text-white"
        >
          <LogOut className="size-4 text-[#8d8d8d]" aria-hidden="true" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64">{sidebar}</div>
          <button
            type="button"
            aria-label="Close menu"
            className="flex-1 bg-black/60"
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-[#e0e0e0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open admin menu"
                className="rounded-none border border-[#e0e0e0] p-2 hover:bg-[#f4f4f4] lg:hidden"
              >
                <Menu className="size-4" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-3">
                {title === "Job Applies" && (
                  <NexusLogo size={28} showText={false} className="rounded-none" />
                )}
                <div>
                  <h1 className="text-xl font-normal text-[#161616]">{title}</h1>
                  {description ? (
                    <p className="text-xs text-[#525252]">{description}</p>
                  ) : null}
                </div>
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
    active: "bg-[#defbe6] text-[#0e6027] border border-[#24a148]",
    selected: "bg-[#defbe6] text-[#0e6027] border border-[#24a148]",
    draft: "bg-[#fef3d6] text-[#8a6100] border border-[#f1c21b]",
    new: "bg-[#edf5ff] text-[#0043ce] border border-[#0f62fe]",
    under_review: "bg-[#edf5ff] text-[#0043ce] border border-[#0f62fe]",
    shortlisted: "bg-[#edf5ff] text-[#0043ce] border border-[#0f62fe]",
    aptitude_test: "bg-[#edf5ff] text-[#0043ce] border border-[#0f62fe]",
    interview: "bg-[#fef3d6] text-[#8a6100] border border-[#f1c21b]",
    on_hold: "bg-[#fef3d6] text-[#8a6100] border border-[#f1c21b]",
    closed: "bg-[#e0e0e0] text-[#525252] border border-[#8d8d8d]",
    archived: "bg-[#e0e0e0] text-[#525252] border border-[#8d8d8d]",
    rejected: "bg-[#fff1f1] text-[#da1e28] border border-[#da1e28]",
  };
  return (
    <span
      className={`inline-flex rounded-none px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${
        tone[status] ?? "bg-[#e0e0e0] text-[#525252] border border-[#8d8d8d]"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-none border border-dashed border-[#e0e0e0] bg-white p-12 text-center">
      <p className="font-semibold text-[#161616]">{title}</p>
      {hint ? <p className="mt-2 text-sm text-[#525252]">{hint}</p> : null}
    </div>
  );
}

export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-none bg-[#e0e0e0]" />
      ))}
    </div>
  );
}
