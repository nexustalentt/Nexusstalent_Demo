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
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-[#e0e0e0] bg-[#f4f4f4] py-16 md:py-20">
      <div className="container-page">
        <div className="eyebrow mb-6">{eyebrow}</div>
        <h1 className="max-w-4xl text-3xl font-light leading-[1.17] text-[#161616] sm:text-4xl md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-[#525252]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
