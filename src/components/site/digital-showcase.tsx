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
      {/* Main Container - Flat Carbon Tile */}
      <div className="relative overflow-hidden rounded-none border border-[#e0e0e0] bg-[#ffffff]">
        {/* Device Top Bar / Browser Bar */}
        <div className="flex flex-col gap-2.5 border-b border-[#e0e0e0] bg-[#f4f4f4] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2 bg-[#da1e28]" />
              <span className="size-2 bg-[#f1c21b]" />
              <span className="size-2 bg-[#24a148]" />
            </div>

            <div className="flex items-center gap-1.5 rounded-none border border-[#e0e0e0] bg-[#ffffff] px-2.5 py-1 text-[11px] text-[#525252] font-mono truncate max-w-[200px] sm:max-w-xs">
              <Globe className="size-3 text-[#0f62fe] shrink-0" />
              <span className="truncate">
                {activeTab === "doctor" && "apexclinic.health/booking"}
                {activeTab === "restaurant" && "artisancafe.com/reserve"}
                {activeTab === "software" && "portal.nexustalent.io/apps"}
              </span>
              <span className="hidden xs:inline-block border border-[#24a148]/30 bg-[#24a148]/10 px-1 text-[9px] text-[#24a148] shrink-0">
                SSL
              </span>
            </div>
          </div>

          {/* Carbon Product Tabs Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-1 border border-[#e0e0e0] bg-[#ffffff] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("doctor")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                activeTab === "doctor"
                  ? "bg-[#0f62fe] text-white font-normal"
                  : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]"
              }`}
            >
              <HeartPulse className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap">Doctor & Clinic</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("restaurant")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                activeTab === "restaurant"
                  ? "bg-[#0f62fe] text-white font-normal"
                  : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]"
              }`}
            >
              <Utensils className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap">Restaurant</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("software")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                activeTab === "software"
                  ? "bg-[#0f62fe] text-white font-normal"
                  : "text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]"
              }`}
            >
              <Layers className="size-3.5 shrink-0" />
              <span className="whitespace-nowrap">Web App</span>
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="w-full bg-[#ffffff] p-4 sm:p-6 md:p-8">
          {/* TAB 1: DOCTOR & HEALTHCARE CLINIC */}
          {activeTab === "doctor" && (
            <div className="w-full space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e0e0] pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center bg-[#0f62fe] text-white">
                    <HeartPulse className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-normal text-sm sm:text-base text-[#161616] truncate">
                        Apex Wellness & Family Clinic
                      </span>
                      <span className="hidden xs:inline-flex border border-[#24a148]/30 bg-[#24a148]/10 px-2 py-0.5 text-[10px] text-[#24a148]">
                        Open Now
                      </span>
                    </div>
                    <span className="block text-xs text-[#525252] truncate">
                      Primary Care · Telehealth · Diagnostics
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <a
                    href="tel:+918041234567"
                    className="flex items-center gap-1 border border-[#e0e0e0] bg-[#f4f4f4] px-3 py-1.5 text-xs text-[#161616] hover:border-[#0f62fe]"
                  >
                    <PhoneCall className="size-3 text-[#0f62fe]" />
                    <span>Direct Call</span>
                  </a>
                  <span className="bg-[#0f62fe] px-3 py-1.5 text-xs text-white">
                    Accepting Patients
                  </span>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-12 border border-[#e0e0e0] bg-[#f4f4f4] p-4 sm:p-6">
                <div className="space-y-4 md:col-span-7">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/doctor-profile.svg"
                      alt="Dr. Sarah Adams, MD"
                      width={56}
                      height={56}
                      className="size-14 shrink-0 rounded-none object-cover border border-[#e0e0e0]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-normal text-base sm:text-lg text-[#161616]">
                          Dr. Sarah Adams, MD
                        </h4>
                        <Award className="size-4 text-[#0f62fe] shrink-0" />
                      </div>
                      <p className="text-xs text-[#0f62fe]">
                        Board Certified Family Physician & Wellness Lead
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#525252]">
                        <Star className="size-3 fill-[#f1c21b] text-[#f1c21b]" />
                        <span>4.98 Rating · 380+ Verified Patients</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
                    Providing comprehensive family healthcare, preventative screenings, and online
                    consultations with instant prescription delivery and medical history access.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {["Preventative Care", "Pediatrics", "Chronic Health", "Telehealth"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="border border-[#e0e0e0] bg-[#ffffff] px-2.5 py-0.5 text-[11px] text-[#525252]"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-3 border border-[#e0e0e0] bg-[#ffffff] p-4 md:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-[#e0e0e0]">
                      <span className="font-normal text-[#161616] flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-[#0f62fe]" /> Available Slots Today
                      </span>
                      <span className="text-[10px] text-[#24a148] bg-[#24a148]/10 px-2 py-0.5">
                        Instant Confirm
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {["10:30 AM", "02:15 PM", "04:45 PM"].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 text-center text-xs transition-colors cursor-pointer ${
                            selectedSlot === slot
                              ? "bg-[#0f62fe] text-white"
                              : "border border-[#e0e0e0] bg-[#f4f4f4] text-[#525252] hover:border-[#0f62fe] hover:text-[#161616]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1.5 text-[11px] text-[#525252]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Video className="size-3 text-[#0f62fe]" /> Video Telehealth:
                        </span>
                        <span className="text-[#161616] font-medium">₹600 / $25</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-[#0f62fe]" /> Clinic Walk-in:
                        </span>
                        <span className="text-[#161616] font-medium">Available</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full flex h-10 items-center justify-center gap-1.5 bg-[#0f62fe] text-xs font-normal text-white hover:bg-[#0050e6] transition-colors"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Confirm Appointment ({selectedSlot})</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center">
                <div className="flex items-center justify-center sm:flex-col gap-2 border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-xs">
                  <CheckCircle2 className="size-4 text-[#24a148] shrink-0" />
                  <div>
                    <span className="font-normal text-[#161616] block sm:inline">
                      HIPAA & Digital Ready
                    </span>
                    <span className="text-[10px] text-[#525252] block">
                      100% Secure patient data
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:flex-col gap-2 border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-xs">
                  <CheckCircle2 className="size-4 text-[#0f62fe] shrink-0" />
                  <div>
                    <span className="font-normal text-[#161616] block sm:inline">
                      Fast Turnkey Launch
                    </span>
                    <span className="text-[10px] text-[#525252] block">Online in 7–10 days</span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:flex-col gap-2 border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-xs">
                  <CheckCircle2 className="size-4 text-[#24a148] shrink-0" />
                  <div>
                    <span className="font-normal text-[#161616] block sm:inline">
                      Direct WhatsApp Alerts
                    </span>
                    <span className="text-[10px] text-[#525252] block">Automated reminders</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTAURANT */}
          {activeTab === "restaurant" && (
            <div className="w-full space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e0e0] pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/restaurant-showcase.svg"
                    alt="Artisan Kitchen & Grill"
                    width={40}
                    height={40}
                    className="size-10 shrink-0 border border-[#e0e0e0] object-cover"
                  />
                  <div>
                    <span className="font-normal text-sm sm:text-base text-[#161616]">
                      Artisan Kitchen & Grill
                    </span>
                    <span className="block text-[11px] text-[#525252]">
                      Fine Dining & Local Bistro
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="border border-[#e0e0e0] bg-[#f4f4f4] px-2.5 py-1 text-xs text-[#525252]">
                    Open Now · Closes 11 PM
                  </span>
                  <span className="bg-[#0f62fe] px-3 py-1.5 text-xs text-white">
                    Reserve Table
                  </span>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-12 border border-[#e0e0e0] bg-[#f4f4f4] p-4 sm:p-6">
                <div className="space-y-3 md:col-span-7">
                  <div className="inline-flex items-center gap-1.5 border border-[#e0e0e0] bg-[#ffffff] px-2.5 py-0.5 text-[11px] text-[#525252]">
                    <Star className="size-3 fill-[#f1c21b] text-[#f1c21b]" />
                    <span>Rated 4.9/5 by 350+ Guests</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-light text-[#161616]">
                    Handcrafted Cuisine. Fresh Local Flavours.
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#525252]">
                    Digital menus, table reservations, direct WhatsApp order routing, and Google
                    Maps integration designed to bring more diners through your doors.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="flex items-center gap-1.5 bg-[#0f62fe] px-4 py-2 text-xs font-normal text-white">
                      <Calendar className="size-3.5" /> Book a Table
                    </span>
                    <span className="flex items-center gap-1.5 border border-[#e0e0e0] bg-[#ffffff] px-4 py-2 text-xs text-[#161616]">
                      <PhoneCall className="size-3.5 text-[#0f62fe]" /> Call Restaurant
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border border-[#e0e0e0] bg-[#ffffff] p-4 md:col-span-5">
                  <div className="text-xs font-normal uppercase text-[#525252] pb-1 tracking-[0.16px]">
                    Quick Highlights
                  </div>
                  <div className="flex items-center justify-between border border-[#e0e0e0] bg-[#f4f4f4] p-2 text-xs">
                    <span className="text-[#161616]">Tasting Menu Available</span>
                    <span className="text-[#0f62fe] font-medium">$48 / guest</span>
                  </div>
                  <div className="flex items-center justify-between border border-[#e0e0e0] bg-[#f4f4f4] p-2 text-xs">
                    <span className="text-[#161616]">Private Event Room</span>
                    <span className="bg-[#24a148]/10 px-2 py-0.5 text-[10px] text-[#24a148]">
                      Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between border border-[#e0e0e0] bg-[#f4f4f4] p-2 text-xs">
                    <span className="text-[#161616]">Online Delivery Orders</span>
                    <span className="text-[#525252]">15–25 mins</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOFTWARE / SAAS APPLICATION */}
          {activeTab === "software" && (
            <div className="w-full space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/images/software-dashboard.svg"
                    alt="Nexus Portal OS"
                    width={36}
                    height={36}
                    className="size-9 shrink-0 border border-[#e0e0e0] object-cover"
                  />
                  <span className="text-xs sm:text-sm font-normal text-[#161616] truncate">
                    Nexus Portal OS
                  </span>
                  <span className="border border-[#0f62fe]/30 bg-[#edf5ff] px-2 py-0.5 text-[10px] text-[#0f62fe] shrink-0">
                    v2.4
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#525252] hidden sm:inline">Production</span>
                  <span className="size-2 bg-[#24a148]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="border border-[#e0e0e0] bg-[#f4f4f4] p-3">
                  <span className="text-[10px] font-normal uppercase text-[#525252] tracking-[0.16px]">
                    Active Users
                  </span>
                  <p className="mt-1 text-lg sm:text-xl font-light text-[#161616]">2,840</p>
                  <span className="text-[10px] text-[#24a148] flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="size-3" /> +18.4%
                  </span>
                </div>
                <div className="border border-[#e0e0e0] bg-[#f4f4f4] p-3">
                  <span className="text-[10px] font-normal uppercase text-[#525252] tracking-[0.16px]">
                    Enquiries Handled
                  </span>
                  <p className="mt-1 text-lg sm:text-xl font-light text-[#161616]">1,120</p>
                  <span className="text-[10px] text-[#0f62fe] flex items-center gap-0.5 mt-0.5">
                    <Sparkles className="size-3" /> Automated
                  </span>
                </div>
                <div className="border border-[#e0e0e0] bg-[#f4f4f4] p-3">
                  <span className="text-[10px] font-normal uppercase text-[#525252] tracking-[0.16px]">
                    Avg Response
                  </span>
                  <p className="mt-1 text-lg sm:text-xl font-light text-[#161616]">1.2m</p>
                  <span className="text-[10px] text-[#525252] flex items-center gap-0.5 mt-0.5">
                    <Clock className="size-3" /> Real-time
                  </span>
                </div>
                <div className="border border-[#e0e0e0] bg-[#f4f4f4] p-3">
                  <span className="text-[10px] font-normal uppercase text-[#525252] tracking-[0.16px]">
                    Security Score
                  </span>
                  <p className="mt-1 text-lg sm:text-xl font-light text-[#161616]">100%</p>
                  <span className="text-[10px] text-[#24a148] flex items-center gap-0.5 mt-0.5">
                    <ShieldCheck className="size-3" /> Verified
                  </span>
                </div>
              </div>

              <div className="border border-[#e0e0e0] bg-[#f4f4f4] p-4">
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <span className="font-normal text-[#161616]">Recent Automated Workflows</span>
                  <span className="text-[#0f62fe] text-[11px]">Active</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border border-[#e0e0e0] bg-[#ffffff] p-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="size-3.5 text-[#24a148] shrink-0" />
                      <span className="text-[#161616] text-xs truncate">
                        Client Intake Portal — Apex Medical
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#525252] shrink-0">Deployed</span>
                  </div>
                  <div className="flex items-center justify-between border border-[#e0e0e0] bg-[#ffffff] p-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="size-3.5 text-[#0f62fe] shrink-0" />
                      <span className="text-[#161616] text-xs truncate">
                        Payment & Billing Gateway Synchronization
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#525252] shrink-0">Success</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Showcase Bottom Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#e0e0e0] bg-[#f4f4f4] px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-[#525252]">
            <Sparkles className="size-3.5 text-[#0f62fe] shrink-0" />
            <span>
              Engineered for responsive execution: desktop, tablet, and mobile displays.
            </span>
          </div>
          <Link
            to="/for-businesses"
            className="inline-flex items-center gap-1.5 text-xs text-[#0f62fe] hover:underline shrink-0"
          >
            Explore business solutions <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
