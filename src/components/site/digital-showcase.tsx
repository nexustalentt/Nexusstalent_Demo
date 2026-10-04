import { useState } from "react";
import {
  Globe,
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
  HeartPulse,
  Utensils,
  MapPin,
  MessageCircle,
  Video,
  Award,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type ViewMode = "doctor" | "restaurant" | "software";

export function DigitalShowcase() {
  const [activeTab, setActiveTab] = useState<ViewMode>("doctor");
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Ambient background glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent/25 via-primary/10 to-accent/20 opacity-60 blur-xl transition-all" />

      {/* Main Container */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/10 bg-card shadow-elegant backdrop-blur-sm">
        {/* Device Top Bar / Browser Bar */}
        <div className="flex flex-col gap-2.5 border-b border-primary/10 bg-surface/90 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 sm:size-3 rounded-full bg-rose-500/80" />
              <span className="size-2.5 sm:size-3 rounded-full bg-amber-500/80" />
              <span className="size-2.5 sm:size-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-background px-2.5 py-1 text-[11px] text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-xs">
              <Globe className="size-3 text-accent shrink-0" />
              <span className="truncate">
                {activeTab === "doctor" && "apexclinic.health/booking"}
                {activeTab === "restaurant" && "artisancafe.com/reserve"}
                {activeTab === "software" && "portal.nexustalent.io/apps"}
              </span>
              <span className="hidden xs:inline-block rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-600 shrink-0">
                SSL
              </span>
            </div>
          </div>

          {/* Device-Adaptive Tab Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-1 rounded-xl border border-primary/10 bg-background/80 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("doctor")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                activeTab === "doctor"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <HeartPulse className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap">Doctor & Clinic</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("restaurant")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                activeTab === "restaurant"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Utensils className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap">Restaurant</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("software")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                activeTab === "software"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Layers className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap">Web App</span>
            </button>
          </div>
        </div>

        {/* Viewport Canvas: Fluid and fully responsive across phone, tablet, and desktop */}
        <div className="w-full bg-background/50 p-3.5 sm:p-6 md:p-8">
          {/* TAB 1: DOCTOR & HEALTHCARE CLINIC (FULLY RESPONSIVE) */}
          {activeTab === "doctor" && (
            <div className="animate-fade-up w-full space-y-4 sm:space-y-6">
              {/* Clinic Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold shadow-sm">
                    <HeartPulse className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-primary truncate">
                        Apex Wellness & Family Clinic
                      </span>
                      <span className="hidden xs:inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        Open Now
                      </span>
                    </div>
                    <span className="block text-xs text-muted-foreground truncate">
                      Primary Care · Telehealth · Diagnostics
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <a
                    href="tel:+918041234567"
                    className="flex items-center gap-1 rounded-lg border border-primary/10 bg-surface px-2.5 py-1.5 text-xs font-semibold text-primary hover:border-accent"
                  >
                    <PhoneCall className="size-3 text-accent" />
                    <span>Direct Call</span>
                  </a>
                  <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
                    Accepting Patients
                  </span>
                </div>
              </div>

              {/* Main Clinic Card: Adapts from 1-column on mobile to 2-column on tablet/desktop */}
              <div className="grid gap-5 md:grid-cols-12 rounded-xl sm:rounded-2xl border border-primary/10 bg-gradient-to-br from-surface to-card p-4 sm:p-6 shadow-sm">
                {/* Doctor Bio & Credentials */}
                <div className="space-y-4 md:col-span-7">
                  <div className="flex items-center gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-md">
                      SA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base sm:text-lg text-primary">
                          Dr. Sarah Adams, MD
                        </h4>
                        <Award className="size-4 text-accent shrink-0" />
                      </div>
                      <p className="text-xs text-accent font-medium">
                        Board Certified Family Physician & Wellness Lead
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 font-semibold">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        <span>4.98 Rating · 380+ Verified Patients</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Providing comprehensive family healthcare, preventative screenings, and online
                    consultations with instant prescription delivery and medical history access.
                  </p>

                  {/* Specialty Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {["Preventative Care", "Pediatrics", "Chronic Health", "Telehealth"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary/10 bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                {/* Appointment Booking Module */}
                <div className="space-y-3 rounded-xl border border-primary/10 bg-background/80 p-4 shadow-sm md:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-primary/5">
                      <span className="font-bold text-primary flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-accent" /> Available Slots Today
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Instant Confirm
                      </span>
                    </div>

                    {/* Time Slot Buttons */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {["10:30 AM", "02:15 PM", "04:45 PM"].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg py-2 text-center text-xs font-semibold transition-all ${
                            selectedSlot === slot
                              ? "bg-accent text-accent-foreground shadow-sm"
                              : "border border-primary/10 bg-surface text-muted-foreground hover:text-primary hover:border-accent"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Video className="size-3 text-accent" /> Video Telehealth:
                        </span>
                        <span className="font-semibold text-primary">₹600 / $25</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-accent" /> Clinic Walk-in:
                        </span>
                        <span className="font-semibold text-primary">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-accent transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="size-3.5 text-accent-foreground" />
                      <span>Confirm Appointment ({selectedSlot})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center">
                <div className="flex items-center justify-center sm:flex-col gap-2 rounded-lg border border-primary/5 bg-surface/70 p-2.5 text-xs">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-primary block sm:inline">
                      HIPAA & Digital Ready
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      100% Secure patient data
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:flex-col gap-2 rounded-lg border border-primary/5 bg-surface/70 p-2.5 text-xs">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  <div>
                    <span className="font-bold text-primary block sm:inline">
                      Fast Turnkey Launch
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Online in 7–10 days
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:flex-col gap-2 rounded-lg border border-primary/5 bg-surface/70 p-2.5 text-xs">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-primary block sm:inline">
                      Direct WhatsApp Alerts
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Automated reminders
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTAURANT & BISTRO (FULLY RESPONSIVE) */}
          {activeTab === "restaurant" && (
            <div className="animate-fade-up w-full space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                    A
                  </div>
                  <div>
                    <span className="font-bold text-sm sm:text-base text-primary">
                      Artisan Kitchen & Grill
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      Fine Dining & Local Bistro
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                    Open Now · Closes 11 PM
                  </span>
                  <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    Reserve Table
                  </span>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-12 rounded-xl sm:rounded-2xl border border-primary/10 bg-gradient-to-br from-surface to-card p-4 sm:p-6 shadow-sm">
                <div className="space-y-3 md:col-span-7">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    <span>Rated 4.9/5 by 350+ Guests</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                    Handcrafted Cuisine. Fresh Local Flavours.
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    Digital menus, table reservations, direct WhatsApp order routing, and Google
                    Maps integration designed to bring more diners through your doors.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-accent-foreground">
                      <Calendar className="size-3.5" /> Book a Table
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg border border-primary/10 bg-card px-3.5 py-2 text-xs font-semibold text-primary">
                      <PhoneCall className="size-3.5 text-accent" /> Call Restaurant
                    </span>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-primary/10 bg-background/80 p-3.5 md:col-span-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1">
                    Quick Highlights
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-surface p-2 text-xs">
                    <span className="font-medium text-primary">Tasting Menu Available</span>
                    <span className="font-semibold text-accent">$48 / guest</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-surface p-2 text-xs">
                    <span className="font-medium text-primary">Private Event Room</span>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-surface p-2 text-xs">
                    <span className="font-medium text-primary">Online Delivery Orders</span>
                    <span className="font-semibold text-muted-foreground">15–25 mins</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOFTWARE / SAAS APPLICATION (FULLY RESPONSIVE) */}
          {activeTab === "software" && (
            <div className="animate-fade-up w-full space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-7 rounded-md bg-accent flex items-center justify-center text-xs font-black text-white shrink-0">
                    N
                  </div>
                  <span className="text-xs sm:text-sm font-bold tracking-tight text-primary truncate">
                    Nexus Portal OS
                  </span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent shrink-0">
                    v2.4
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                    Production
                  </span>
                  <span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-primary/10 bg-surface/70 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Users
                  </span>
                  <p className="mt-1 text-lg sm:text-xl font-bold text-primary">2,840</p>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="size-3" /> +18.4%
                  </span>
                </div>
                <div className="rounded-xl border border-primary/10 bg-surface/70 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Enquiries Handled
                  </span>
                  <p className="mt-1 text-lg sm:text-xl font-bold text-primary">1,120</p>
                  <span className="text-[10px] font-semibold text-accent flex items-center gap-0.5 mt-0.5">
                    <Sparkles className="size-3" /> Automated
                  </span>
                </div>
                <div className="rounded-xl border border-primary/10 bg-surface/70 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg Response
                  </span>
                  <p className="mt-1 text-lg sm:text-xl font-bold text-primary">1.2m</p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                    <Clock className="size-3" /> Real-time
                  </span>
                </div>
                <div className="rounded-xl border border-primary/10 bg-surface/70 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Security Score
                  </span>
                  <p className="mt-1 text-lg sm:text-xl font-bold text-primary">100%</p>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <ShieldCheck className="size-3" /> Verified
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-primary/10 bg-surface/50 p-3 sm:p-4">
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Recent Automated Workflows</span>
                  <span className="text-accent text-[11px] font-semibold">Active</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-card p-2 border border-primary/5">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium text-primary text-xs truncate">
                        Client Intake Portal — Apex Medical
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      Deployed
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-card p-2 border border-primary/5">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                      <span className="font-medium text-primary text-xs truncate">
                        Payment & Billing Gateway Synchronization
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      Success
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Showcase Bottom Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-primary/10 bg-surface px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-4 text-accent shrink-0" />
            <span className="leading-tight">
              Responsive engineering: automatically adjusts to laptop, tablet, and mobile screens.
            </span>
          </div>
          <Link
            to="/for-businesses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline shrink-0"
          >
            Explore business solutions <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
