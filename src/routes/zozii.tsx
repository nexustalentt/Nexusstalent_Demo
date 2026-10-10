import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  Cpu,
  Download,
  EyeOff,
  Headphones,
  Keyboard,
  Lock,
  MessageCircle,
  Mic,
  Monitor,
  Radio,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { PublicShell } from "@/components/site/public-shell";

const DOWNLOAD_URL = "/api/public/zozii-download";

export const Route = createFileRoute("/zozii")({
  head: () => ({
    meta: [
      { title: "Zozii — Invisible AI Meeting Assistant | Nexus Talent" },
      {
        name: "description",
        content:
          "Zozii is a Windows desktop AI companion for Nexus Talent workflows. Invisible to screen shares, local WASAPI audio, sub-320ms answers.",
      },
      { property: "og:title", content: "Zozii — Invisible AI Meeting Assistant" },
      {
        property: "og:description",
        content:
          "Download Zozii v1.09.01 for Windows. Listen to meetings, ask questions, and receive instant streaming answers.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ZoziiPage,
});

const capabilityPills = [
  "WDA_EXCLUDEFROMCAPTURE",
  "WASAPI Loopback Tap",
  "<320ms Realtime Stream",
  "10-Min Instant Trial",
];

const engineeringFeatures = [
  {
    icon: EyeOff,
    title: "Invisible in Screen Shares",
    description:
      "The Zozii window is excluded at the Desktop Window Manager (DWM) level using native OS capture flags. Teams, Zoom, Google Meet, and screen recorders render right through it.",
  },
  {
    icon: Headphones,
    title: "Digital Loopback Audio Tap",
    description:
      "Directly captures system audio output from your sound hardware without third-party virtual audio cables. Zero audio is uploaded or stored remotely.",
  },
  {
    icon: Zap,
    title: "Sub-Second Token Streaming",
    description:
      "Engineered with Groq LLaMA-3.3 and Google Gemini high-speed streaming APIs. Answers begin rendering word-by-word in milliseconds.",
  },
];

const modalities = [
  {
    icon: Mic,
    title: "Voice Prompts",
    description:
      "Press Ctrl+Z and speak out loud into your microphone. Zozii transcribes and answers live.",
  },
  {
    icon: Radio,
    title: "Meeting Audio Tap",
    description:
      "Enable passive listening in settings. Zozii hears questions from other participants and formulates answers.",
  },
  {
    icon: Keyboard,
    title: "Stealth Keyboard",
    description:
      "Prefer typing? Enter queries into the stealth prompt box and hit enter — works like an invisible private terminal.",
  },
  {
    icon: MessageCircle,
    title: "Real-Time Stream",
    description:
      "Tokens appear incrementally word-by-word. You never have to wait for the complete answer before reading.",
  },
];

const architectureItems = [
  {
    label: "RUNTIME",
    title: "Electron 32 & TypeScript",
    note: "Hardened desktop environment with secure context isolation and fast IPC.",
  },
  {
    label: "DWM WIN32",
    title: "Direct3D Screen Guard",
    note: "Native exclusion flags omit the window buffer from any capture pipe.",
  },
  {
    label: "AUDIO PIPELINE",
    title: "WASAPI Audio Session",
    note: "Direct digital loopback from your default playback device.",
  },
  {
    label: "LLM ENGINE",
    title: "Groq & Gemini Dual Backend",
    note: "Switch dynamically between Groq LPU inference and Google Gemini.",
  },
  {
    label: "INFRASTRUCTURE",
    title: "Supabase Auth & Storage",
    note: "Encrypted accounts, verified sessions, and fast installer distribution.",
  },
  {
    label: "PRIVACY",
    title: "Local-First Zero Retention",
    note: "No meeting audio, transcripts, or personal logs are persisted remotely.",
  },
];

const quickstartSteps = [
  "Download & install Zozii from the link below.",
  "Launch Zozii and register with your email and password.",
  "Your 10-minute free trial starts instantly upon registration.",
  "Open Settings and add your Groq or Gemini API key.",
  "Click Start or press Ctrl+Z to begin listening.",
  "Ask a question aloud or type it into the stealth prompt.",
  "Read streaming answers word-by-word as they appear.",
];

const faqItems = [
  {
    q: "Do I need to activate anything after registering?",
    a: "No. Your account is active immediately upon registration. You can start using Zozii right away with the 10-minute free trial.",
  },
  {
    q: "What happens when my free trial runs out?",
    a: "Zozii shows a simple 'Get More Access' dialog where you can request additional hours or days. Your administrator reviews and grants access with one click.",
  },
  {
    q: "Does the meeting audio feature record or upload conversations?",
    a: "No. Zozii uses local WASAPI loopback capture on your sound card to understand meeting dialogue. Nothing is stored on remote servers or shared with third parties.",
  },
  {
    q: "Which AI providers are supported?",
    a: "Zozii supports Groq (Whisper + LLaMA-3.3) and Google Gemini (Gemini 1.5 Pro). You can toggle between them or update your API keys anytime in Settings.",
  },
  {
    q: "Can participants see Zozii when I share my screen?",
    a: "No. Zozii applies Windows DWM_EXCLUDEFROMCAPTURE window protection. It is physically hidden from Teams, Zoom, Google Meet, OBS, and screenshot utilities.",
  },
];

function DownloadButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const base =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-none bg-[#0f62fe] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0353e9]"
      : "inline-flex items-center justify-center gap-2 rounded-none border border-[#161616] px-6 py-3.5 text-sm font-semibold text-[#161616] transition-colors hover:bg-[#161616] hover:text-white";
  return (
    <a
      href={DOWNLOAD_URL}
      download
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${className}`}
    >
      <Download className="size-4" aria-hidden="true" />
      {children}
    </a>
  );
}

function ZoziiPage() {
  return (
    <PublicShell>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#e0e0e0] bg-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 border border-[#e0e0e0] bg-[#f4f4f4] px-2.5 py-1 text-xs font-semibold text-[#525252]">
                <span className="size-1.5 bg-[#0f62fe]" />
                PRODUCT SPECIFICATION · DESKTOP RUNTIME
              </div>
              <h1 className="text-4xl font-light tracking-tight text-[#161616] sm:text-5xl lg:text-6xl">
                Meet Zozii — <span className="font-normal text-[#0f62fe]">invisible</span> AI meeting assistant
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#525252]">
                Listen to meetings, speak or type questions, and receive instant streaming answers —
                rendered directly on your display, completely invisible to screen shares and meeting
                participants.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <DownloadButton>Download for Windows (.exe)</DownloadButton>
                <span className="font-mono text-xs font-medium text-[#525252]">v1.09.01 · Win32/x64</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {capabilityPills.map((pill) => (
                  <span
                    key={pill}
                    className="border border-[#e0e0e0] bg-[#f4f4f4] px-2.5 py-1 font-mono text-xs text-[#161616]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Live runtime card - Carbon code terminal */}
            <div className="border border-[#e0e0e0] bg-[#f4f4f4] p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-[#525252]">
                  <span className="size-2 bg-[#24a148]" />
                  <span>zozii-engine.ts</span>
                </div>
                <span className="border border-[#24a148] bg-[#defbe6] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0e6027]">
                  SYSTEM ONLINE
                </span>
              </div>
              <div className="mt-4 border border-[#393939] bg-[#161616] p-5 font-mono text-xs leading-relaxed text-[#f4f4f4] md:text-sm">
                <span className="text-[#8d8d8d]">// initializing invisible meeting assistant</span>
                <br />
                <span className="text-[#78a9ff]">const</span> assistant = {"{"}
                <br />
                &nbsp;&nbsp;role: <span className="text-[#42be65]">"Invisible AI Co-Pilot"</span>,
                <br />
                &nbsp;&nbsp;stealth: <span className="text-[#42be65]">"WDA_EXCLUDEFROMCAPTURE"</span>,
                <br />
                &nbsp;&nbsp;audioTap: <span className="text-[#42be65]">"WASAPI_LOOPBACK_ACTIVE"</span>,
                <br />
                &nbsp;&nbsp;models: [<span className="text-[#42be65]">"Groq/LLaMA-3.3"</span>,{" "}
                <span className="text-[#42be65]">"Gemini 1.5 Pro"</span>],
                <br />
                &nbsp;&nbsp;latency: <span className="text-[#42be65]">"&lt; 320ms"</span>,
                <br />
                &nbsp;&nbsp;screenShareSafe: <span className="text-[#78a9ff]">true</span>,
                <br />
                &nbsp;&nbsp;active: <span className="text-[#78a9ff]">true</span>
                <br />
                {"}"};
              </div>
              <div className="mt-4 border border-[#e0e0e0] bg-white p-4">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#525252]">
                  Live Stream Simulation
                </p>
                <div className="mt-3 space-y-2 text-sm text-[#161616]">
                  <p>
                    <span className="font-semibold text-[#525252]">&gt; Meeting:</span> “How do you manage zero downtime database migrations?”
                  </p>
                  <p className="border-l-2 border-[#0f62fe] pl-3 text-[#161616]">
                    <span className="font-semibold text-[#0f62fe]">&gt; Zozii:</span> “Expand-contract pattern: add nullable column first, backfill asynchronously in batches, switch dual writes, then migrate read queries before pruning.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE ENGINEERING */}
      <section className="py-20">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Core Engineering</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-[#161616] md:text-4xl">
              Engineered for absolute discretion
            </h2>
            <p className="mt-3 text-base text-[#525252]">
              Hardware and OS-level innovations that keep your AI assistant private, ultra-low
              latency, and reliable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {engineeringFeatures.map((feature) => (
              <article
                key={feature.title}
                className="group border border-[#e0e0e0] bg-white p-8 transition-colors hover:border-[#0f62fe]"
              >
                <div className="mb-6 flex size-10 items-center justify-center bg-[#edf5ff] text-[#0f62fe]">
                  <feature.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-[#161616]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#525252]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTION MODALITIES */}
      <section className="border-y border-[#e0e0e0] bg-[#f4f4f4] py-20">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Interaction Modalities</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-[#161616] md:text-4xl">
              Four ways to interact with Zozii
            </h2>
            <p className="mt-3 text-base text-[#525252]">
              Flexible multi-modal input designed for seamless, discreet workflow integration during
              critical meetings.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modalities.map((modality) => (
              <div
                key={modality.title}
                className="border border-[#e0e0e0] bg-white p-6 transition-colors hover:border-[#0f62fe]"
              >
                <modality.icon className="size-6 text-[#0f62fe]" aria-hidden="true" />
                <h3 className="mt-5 text-base font-semibold text-[#161616]">{modality.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525252]">
                  {modality.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-[#525252]">
            <span className="font-semibold text-[#161616]">[i]</span> Prompts and meeting transcription currently
            supported in English.
          </p>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="py-20">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Architecture</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-[#161616] md:text-4xl">
              Under the hood
            </h2>
            <p className="mt-3 text-base text-[#525252]">
              A breakdown of the native system stack powering Zozii&apos;s desktop runtime.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {architectureItems.map((item) => (
              <div
                key={item.label}
                className="border border-[#e0e0e0] bg-white p-6 transition-colors hover:border-[#0f62fe]"
              >
                <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#0f62fe]">
                  {item.label}
                </span>
                <h3 className="mt-2 text-base font-semibold text-[#161616]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#525252]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICKSTART */}
      <section className="border-y border-[#e0e0e0] bg-[#f4f4f4] py-20">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">Quickstart</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-[#161616] md:text-4xl">
              Get started in 3 minutes
            </h2>
            <p className="mt-3 text-base text-[#525252]">
              Simple steps from downloading the installer to receiving your first live streaming
              answer.
            </p>
          </div>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickstartSteps.map((step, index) => (
              <li key={step} className="flex gap-4 border border-[#e0e0e0] bg-white p-6">
                <div className="flex size-7 shrink-0 items-center justify-center bg-[#0f62fe] font-mono text-xs font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-[#525252]">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f62fe]">FAQ</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-[#161616] md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-base text-[#525252]">
              Clear answers regarding privacy, screen protection, audio capture, and account quotas.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faqItems.map((item, index) => (
              <div
                key={item.q}
                className="border border-[#e0e0e0] bg-white p-6"
              >
                <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#8d8d8d]">
                  // {String(index + 1).padStart(2, "0")} · FAQ
                </span>
                <h3 className="mt-3 text-base font-semibold text-[#161616]">{item.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#525252]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA - Carbon charcoal banner */}
      <section className="pb-20">
        <div className="container-page">
          <div className="border border-[#393939] bg-[#161616] p-10 text-white md:p-14">
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#78a9ff]">
                  Deployment Ready
                </p>
                <h2 className="mt-2 text-3xl font-light text-white md:text-4xl">
                  Ready to experience invisible AI co-piloting?
                </h2>
                <p className="mt-3 text-sm text-[#c6c6c6]">
                  Download the desktop application, register in seconds, and start getting instant
                  answers in your meetings.
                </p>
              </div>
              <a
                href={DOWNLOAD_URL}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-none bg-[#0f62fe] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#0353e9]"
              >
                <Download className="size-4" aria-hidden="true" />
                Download for Windows (.exe)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-[#e0e0e0] py-6">
        <div className="container-page text-center">
          <p className="font-mono text-xs text-[#525252]">
            Zozii by Nexus Talent · a Nexus Talent product · File: DTDC.Service.Setup.exe · ~91 MB
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
