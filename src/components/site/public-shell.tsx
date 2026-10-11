import { type ReactNode, useState, useEffect } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { TalkToUsModal } from "./talk-to-us-modal";
import { FloatingSupportWidget } from "./floating-support-widget";

export function PublicShell({ children }: { children: ReactNode }) {
  const [talkOpen, setTalkOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setTalkOpen(true);
    window.addEventListener("open-talk-modal", handleOpen);
    return () => window.removeEventListener("open-talk-modal", handleOpen);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#ffffff] text-[#161616] relative selection:bg-[#0f62fe]/15 selection:text-[#161616]">
      <SiteHeader onOpenTalk={() => setTalkOpen(true)} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Nexus Talent Floating Support Widget & Modal */}
      <FloatingSupportWidget onOpen={() => setTalkOpen((prev) => !prev)} isOpen={talkOpen} />
      <TalkToUsModal isOpen={talkOpen} onClose={() => setTalkOpen(false)} />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#f8fafc] py-16 md:py-24">
      {/* Faint digital dot-grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_85%_70%_at_50%_35%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Ambient mesh gradient glows (purple, deep blue, cyan) */}
      <div
        className="pointer-events-none absolute -top-10 left-[5%] h-[380px] w-[450px] rounded-full bg-gradient-to-r from-purple-500/15 via-blue-600/15 to-cyan-400/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-20 right-[5%] h-[420px] w-[480px] rounded-full bg-gradient-to-br from-blue-600/15 via-cyan-400/12 to-purple-500/12 blur-3xl"
        aria-hidden="true"
      />

      {/* Subtle glowing particles */}
      <div
        className="pointer-events-none absolute top-20 right-[25%] size-2 rounded-full bg-cyan-400/60 blur-[0.5px] hidden lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-36 right-[18%] size-2.5 rounded-full bg-purple-500/40 blur-[0.5px] hidden lg:block"
        aria-hidden="true"
      />

      <div className="container-page relative z-10">
        {/* Glowing Pill Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/75 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-md">
          <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          <span>{eyebrow}</span>
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-3xl font-extrabold leading-[1.14] tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            {subtitle}
          </p>
        ) : null}

        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
