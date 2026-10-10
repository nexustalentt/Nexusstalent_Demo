import { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface FloatingSupportWidgetProps {
  onOpen: () => void;
  isOpen?: boolean;
}

/**
 * Nexus Talent Floating Support Widget
 * Interactive floating trigger featuring the illustrated waving assistant and speech bubble.
 * Clicking anywhere on the avatar or bubble triggers the chat window.
 */
export function FloatingSupportWidget({ onOpen, isOpen }: FloatingSupportWidgetProps) {
  const [showGreeting, setShowGreeting] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  // Initialize greeting bubble visibility with smooth delay
  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem("nexus_support_greeting_dismissed");
      if (!isDismissed) {
        const timer = setTimeout(() => {
          setShowGreeting(true);
          setIsWaving(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {
      const timer = setTimeout(() => setShowGreeting(true), 700);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  // Wave on load and then settle
  useEffect(() => {
    if (isWaving) {
      const timer = setTimeout(() => setIsWaving(false), 3200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isWaving]);

  const handleDismissGreeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGreeting(false);
    try {
      sessionStorage.setItem("nexus_support_greeting_dismissed", "true");
    } catch {}
  };

  const handleTrigger = () => {
    onOpen();
  };

  if (isOpen) {
    return null;
  }

  return (
    <aside
      aria-label="Nexus Talent Support Widget"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] right-[max(1.25rem,env(safe-area-inset-right,1.25rem))] z-40 select-none pointer-events-auto"
    >
      {/* Clickable Single Container Wrapping Avatar & Speech Bubble */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleTrigger}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTrigger();
          }
        }}
        onMouseEnter={() => setIsWaving(true)}
        onMouseLeave={() => setIsWaving(false)}
        aria-label="Chat with Nexus Talent Support"
        title="Chat with Nexus Talent Support"
        className="group flex items-end justify-end gap-2.5 sm:gap-3 max-w-[calc(100vw-2rem)] cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.05] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f62fe] focus-visible:ring-offset-2 motion-reduce:hover:transform-none"
        style={{ cursor: "pointer" }}
      >
        {/* White Greeting Speech Bubble */}
        {showGreeting && (
          <div
            aria-label="Hey there! Need a little help? Click to chat with us."
            className="relative bg-white border border-[#e0e0e0] px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-300 group-hover:border-[#0f62fe]/50 group-hover:shadow-[0_10px_28px_rgba(15,98,254,0.22)] animate-fade-up max-w-[210px] sm:max-w-[240px]"
            style={{ borderRadius: "16px" }}
          >
            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleDismissGreeting}
              aria-label="Dismiss greeting"
              className="absolute -top-2 -left-2 size-5 bg-white border border-[#e0e0e0] text-[#717171] hover:text-[#161616] hover:bg-[#f4f4f4] transition-colors flex items-center justify-center shadow-sm cursor-pointer"
              style={{ borderRadius: "9999px" }}
            >
              <X className="size-2.5" />
            </button>

            <div className="space-y-0.5 pr-1">
              <p className="text-xs sm:text-[13px] font-semibold text-[#161616] tracking-tight leading-snug flex items-center gap-1">
                <span>Hey there!</span>
                <span className="inline-block origin-bottom-right animate-assistant-wave">👋</span>
              </p>
              <p className="text-[11px] sm:text-xs text-[#525252] leading-snug font-normal">
                Need a little help?
              </p>
            </div>

            {/* Speech bubble pointer arrow pointing right towards the assistant */}
            <div
              className="absolute -right-1.5 bottom-4 size-3 bg-white border-t border-r border-[#e0e0e0] rotate-45 pointer-events-none"
            />
          </div>
        )}

        {/* Assistant Avatar with Waving Character & Green Online Indicator */}
        <div className="relative shrink-0">
          <div
            className="relative size-14 sm:size-16 bg-gradient-to-b from-[#edf5ff] via-[#d0e2ff] to-[#a6c8ff] border-2 border-white shadow-[0_6px_22px_rgba(15,98,254,0.30)] group-hover:shadow-[0_8px_28px_rgba(15,98,254,0.45)] flex items-end justify-center overflow-hidden transition-all duration-300"
            style={{ borderRadius: "9999px" }}
          >
            {/* Illustrated Female Support Assistant Waving */}
            <picture>
              <source srcSet="/images/support-assistant-avatar.webp" type="image/webp" />
              <img
                src="/images/support-assistant-avatar.png"
                alt="Nexus Talent Support Specialist"
                width={64}
                height={64}
                loading="eager"
                className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                  isWaving ? "animate-assistant-wave" : "group-hover:rotate-2"
                }`}
              />
            </picture>
          </div>

          {/* Green Online Status Dot with subtle pulse */}
          <span
            className="absolute bottom-0 right-0 flex size-3.5 pointer-events-none"
            title="Online"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#24a148] opacity-75" />
            <span
              className="relative inline-flex size-3.5 bg-[#24a148] border-2 border-white"
              style={{ borderRadius: "9999px" }}
            />
          </span>
        </div>
      </div>
    </aside>
  );
}

// Backward-compatible alias
export const FloatingTalkButton = FloatingSupportWidget;
