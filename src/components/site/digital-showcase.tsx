import { useState } from "react";
import {
  Globe,
  Smartphone,
  Laptop,
  CheckCircle2,
  Star,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  PhoneCall,
  Clock,
  Layers,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type ViewMode = "website" | "app" | "mobile";

export function DigitalShowcase() {
  const [activeTab, setActiveTab] = useState<ViewMode>("website");

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Glow highlight background */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-accent/30 via-primary/10 to-accent/20 opacity-70 blur-xl transition-all" />

      {/* Main Showcase Container */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-elegant backdrop-blur-sm">
        {/* Device Header / Browser Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-primary/10 bg-surface/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-rose-500/80" />
            <span className="size-3 rounded-full bg-amber-500/80" />
            <span className="size-3 rounded-full bg-emerald-500/80" />
            <div className="ml-4 hidden items-center gap-2 rounded-full border border-primary/10 bg-background px-3 py-1 text-xs text-muted-foreground sm:flex">
              <Globe className="size-3 text-accent" />
              <span className="font-mono text-[11px]">
                {activeTab === "website" && "https://artisancafebistro.com"}
                {activeTab === "app" && "https://app.nexussolutions.io/dashboard"}
                {activeTab === "mobile" && "https://m.apexclinic.co/book"}
              </span>
              <span className="ml-1 rounded bg-emerald-500/10 px-1 py-0.5 text-[9px] font-semibold text-emerald-600">
                SSL Secured
              </span>
            </div>
          </div>

          {/* Interactive Mode Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-primary/10 bg-background p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("website")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all ${
                activeTab === "website"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Laptop className="size-3.5" />
              <span>Business Web</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("app")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all ${
                activeTab === "app"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Web App</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("mobile")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all ${
                activeTab === "mobile"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Smartphone className="size-3.5" />
              <span>Mobile View</span>
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="min-h-[380px] bg-background/50 p-4 sm:p-6 md:p-8">
          {/* TAB 1: Business Website Preview */}
          {activeTab === "website" && (
            <div className="animate-fade-up space-y-6">
              {/* Fake Client Brand Bar */}
              <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                    A
                  </div>
                  <div>
                    <span className="font-bold text-sm text-primary">Artisan Kitchen & Grill</span>
                    <span className="block text-[10px] text-muted-foreground">
                      Fine Dining & Local Bistro
                    </span>
                  </div>
                </div>
                <div className="hidden gap-4 text-xs font-medium text-muted-foreground md:flex">
                  <span className="text-primary font-semibold">Menu</span>
                  <span>Our Story</span>
                  <span>Locations</span>
                  <span>Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent sm:inline-block">
                    Open Now · Closes 11 PM
                  </span>
                  <span className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground">
                    Reserve Table
                  </span>
                </div>
              </div>

              {/* Website Hero Card */}
              <div className="grid gap-6 rounded-xl border border-primary/10 bg-gradient-to-br from-surface to-background p-6 md:grid-cols-12 md:items-center">
                <div className="space-y-4 md:col-span-7">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    <span>Rated 4.9/5 by 350+ Local Guests</span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                    Handcrafted Cuisine. Fresh Local Flavours.
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Book your intimate evening, view our seasonal degustation menu, or order
                    signature dishes directly.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <span className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-foreground">
                      <Calendar className="size-3.5" /> Book a Table
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg border border-primary/10 bg-card px-4 py-2 text-xs font-semibold text-primary">
                      <PhoneCall className="size-3.5 text-accent" /> Call Restaurant
                    </span>
                  </div>
                </div>

                {/* Interactive Highlight Panel */}
                <div className="space-y-3 rounded-xl border border-primary/10 bg-card p-4 shadow-sm md:col-span-5">
                  <div className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
                    Quick Highlights
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-surface p-2.5 text-xs">
                      <span className="font-medium text-primary">Tasting Menu Available</span>
                      <span className="font-semibold text-accent">$48 / guest</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface p-2.5 text-xs">
                      <span className="font-medium text-primary">Private Event Room</span>
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                        Available
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface p-2.5 text-xs">
                      <span className="font-medium text-primary">Online Orders Delivery</span>
                      <span className="font-semibold text-muted-foreground">15–25 mins</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                <div className="rounded-lg border border-primary/5 bg-surface/60 p-3">
                  <p className="text-xs font-bold text-primary">99.9% Uptime</p>
                  <p className="text-[10px] text-muted-foreground">Fast cloud hosting</p>
                </div>
                <div className="rounded-lg border border-primary/5 bg-surface/60 p-3">
                  <p className="text-xs font-bold text-primary">SEO Optimised</p>
                  <p className="text-[10px] text-muted-foreground">Google local maps top 3</p>
                </div>
                <div className="rounded-lg border border-primary/5 bg-surface/60 p-3">
                  <p className="text-xs font-bold text-primary">Zero Setup Hassle</p>
                  <p className="text-[10px] text-muted-foreground">Turnkey launch in days</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Web Application / SaaS Preview */}
          {activeTab === "app" && (
            <div className="animate-fade-up space-y-6">
              {/* App Navigation Bar */}
              <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-accent flex items-center justify-center text-xs font-black text-white">
                    N
                  </div>
                  <span className="text-xs font-bold tracking-tight text-primary">
                    Nexus Portal OS
                  </span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    v2.4 Live
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Workspace: Main Branch
                  </span>
                  <span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                </div>
              </div>

              {/* Metric Row */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-primary/10 bg-card p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Users
                  </span>
                  <p className="mt-1 text-xl font-bold text-primary">2,840</p>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="size-3" /> +18.4% this month
                  </span>
                </div>
                <div className="rounded-xl border border-primary/10 bg-card p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Enquiries Handled
                  </span>
                  <p className="mt-1 text-xl font-bold text-primary">1,120</p>
                  <span className="text-[10px] font-semibold text-accent flex items-center gap-0.5 mt-0.5">
                    <Sparkles className="size-3" /> 98% automated
                  </span>
                </div>
                <div className="rounded-xl border border-primary/10 bg-card p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg Response Time
                  </span>
                  <p className="mt-1 text-xl font-bold text-primary">1.2m</p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                    <Clock className="size-3" /> Real-time queue
                  </span>
                </div>
                <div className="rounded-xl border border-primary/10 bg-card p-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Security Score
                  </span>
                  <p className="mt-1 text-xl font-bold text-primary">100%</p>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <ShieldCheck className="size-3" /> SOC2 Compliant
                  </span>
                </div>
              </div>

              {/* Data Table / Activity Feed Mockup */}
              <div className="rounded-xl border border-primary/10 bg-surface/50 p-4">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Recent Automated Pipelines</span>
                  <span className="text-accent hover:underline cursor-pointer">
                    View audit logs
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-card p-2.5 border border-primary/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span className="font-medium text-primary">
                        Client Onboarding Portal — Apex Law
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Deployed 12m ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-card p-2.5 border border-primary/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-accent" />
                      <span className="font-medium text-primary">
                        Payment & Billing Gateway Synchronization
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Success · 0 errors
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Mobile Experience Preview */}
          {activeTab === "mobile" && (
            <div className="animate-fade-up mx-auto max-w-sm rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-xl">
              {/* Mobile Status Bar */}
              <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-semibold text-muted-foreground">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span className="size-2 rounded-full bg-primary" />
                </div>
              </div>

              {/* Mobile Card Interface */}
              <div className="space-y-4 rounded-xl border border-primary/10 bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Dr. Sarah Adams, MD</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                    Online Consults
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Family Health & Preventative Wellness Clinic. Fast bookings with instant
                  confirmation.
                </p>

                {/* Mobile Button Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    className="rounded-lg bg-accent py-2 text-center text-xs font-bold text-accent-foreground"
                  >
                    Select Slot
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-primary/15 bg-background py-2 text-center text-xs font-semibold text-primary"
                  >
                    Directions
                  </button>
                </div>
              </div>

              {/* Quick Contact Bar for Mobile */}
              <div className="mt-4 flex items-center justify-around border-t border-primary/10 pt-3 text-[11px] text-muted-foreground">
                <span className="font-semibold text-accent">Tap to Call</span>
                <span>•</span>
                <span className="font-semibold text-emerald-600">WhatsApp Chat</span>
                <span>•</span>
                <span className="font-semibold text-primary">Hours</span>
              </div>
            </div>
          )}
        </div>

        {/* Showcase Bottom Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 bg-surface px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-4 text-accent" />
            <span>
              Engineered with{" "}
              <strong className="text-primary font-semibold">
                React, TypeScript & Tailwind CSS
              </strong>{" "}
              for peak velocity.
            </span>
          </div>
          <Link
            to="/for-businesses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
          >
            Explore business digital solutions <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
