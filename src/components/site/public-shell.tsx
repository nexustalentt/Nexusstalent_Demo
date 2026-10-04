import { type ReactNode, useState, useEffect } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { TalkToUsModal, FloatingTalkButton } from "./talk-to-us-modal";

export function PublicShell({ children }: { children: ReactNode }) {
  const [talkOpen, setTalkOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setTalkOpen(true);
    window.addEventListener("open-talk-modal", handleOpen);
    return () => window.removeEventListener("open-talk-modal", handleOpen);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background relative selection:bg-accent/20">
      <SiteHeader onOpenTalk={() => setTalkOpen(true)} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Floating Talk to Us button & Interactive Agent Popup */}
      <FloatingTalkButton onOpen={() => setTalkOpen(true)} />
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
    <section className="border-b border-primary/5 bg-surface py-16 md:py-20">
      <div className="container-page">
        <div className="eyebrow mb-6">{eyebrow}</div>
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-primary md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
