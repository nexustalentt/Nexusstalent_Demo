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
    /* =========================================================================
       [LEGACY SUPPORT TRIGGER - SAFELY COMMENTED OUT]
       The previous behavior triggered the legacy contextual inquiry modal:
       onOpen();
       Uncomment the line above if you ever need to restore the legacy modal.
       ========================================================================= */

    // NEW BEHAVIOR: Safely route click to custom-built Nexi AI Agent
    if (typeof window !== "undefined") {
      if (typeof (window as any).toggleNexiChat === "function") {
        (window as any).toggleNexiChat();
      } else {
        const chatWin = document.getElementById("nexiChatWindow");
        if (chatWin) {
          chatWin.classList.toggle("nexi-active");
        } else {
          // Fallback if Nexi is not mounted to ensure button never fails
          onOpen();
        }
      }
    }
  };

  if (isOpen) {
    return null;
  }

  return (
    <aside
      aria-label="Nexus Talent Support Widget"
      className="fixed bottom-6 right-6 z-40 select-none pointer-events-auto"
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
            className="relative w-14 h-14 bg-gradient-to-b from-[#edf5ff] via-[#d0e2ff] to-[#a6c8ff] border-2 border-white shadow-[0_6px_22px_rgba(15,98,254,0.30)] group-hover:shadow-[0_8px_28px_rgba(15,98,254,0.45)] flex items-end justify-center overflow-hidden transition-all duration-300 rounded-full"
          >
            {/* Modern, Flat-Vector Cute Waving Teddy Bear SVG */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Cute Waving Teddy Bear"
            >
              {/* Left Ear */}
              <g id="teddy-left-ear">
                <circle cx="30" cy="28" r="11" fill="#8D5524" />
                <circle cx="30" cy="28" r="6.5" fill="#E0A96D" />
              </g>

              {/* Right Ear */}
              <g id="teddy-right-ear">
                <circle cx="70" cy="28" r="11" fill="#8D5524" />
                <circle cx="70" cy="28" r="6.5" fill="#E0A96D" />
              </g>

              {/* Body / Torso */}
              <path
                d="M 27 68 C 24 80 23 92 23 100 L 77 100 C 77 92 76 80 73 68 Z"
                fill="#8D5524"
              />
              {/* Tummy Patch */}
              <ellipse cx="50" cy="85" rx="16.5" ry="16.5" fill="#F8DEC0" />

              {/* Left Arm (Resting on side) */}
              <path
                d="M 28 68 C 23 74 22 83 25 88 C 28 92 34 91 35 85 C 36 80 35 73 31 68 Z"
                fill="#8D5524"
              />
              {/* Left Paw Pad */}
              <ellipse cx="29" cy="85" rx="3.5" ry="3.5" fill="#F8DEC0" />

              {/* Head Base */}
              <ellipse cx="50" cy="48" rx="23.5" ry="21.5" fill="#9C5E2D" />

              {/* Rosy Cheeks */}
              <ellipse cx="33" cy="51" rx="4.5" ry="2.8" fill="#FCA5A5" opacity="0.65" />
              <ellipse cx="67" cy="51" rx="4.5" ry="2.8" fill="#FCA5A5" opacity="0.65" />

              {/* Eyes with Sparkle Highlights */}
              <g id="teddy-eyes">
                {/* Left Eye */}
                <circle cx="39.5" cy="44" r="3.6" fill="#231409" />
                <circle cx="38.3" cy="42.7" r="1.3" fill="#FFFFFF" />
                <circle cx="40.8" cy="45.1" r="0.6" fill="#FFFFFF" opacity="0.8" />

                {/* Right Eye */}
                <circle cx="60.5" cy="44" r="3.6" fill="#231409" />
                <circle cx="59.3" cy="42.7" r="1.3" fill="#FFFFFF" />
                <circle cx="61.8" cy="45.1" r="0.6" fill="#FFFFFF" opacity="0.8" />
              </g>

              {/* Muzzle / Snout */}
              <ellipse cx="50" cy="54" rx="12.5" ry="9.5" fill="#F8DEC0" />

              {/* Nose */}
              <ellipse cx="50" cy="49.5" rx="4.5" ry="3.2" fill="#2E180B" />
              <ellipse cx="48.8" cy="48.6" rx="1.2" ry="0.8" fill="#FFFFFF" opacity="0.6" />

              {/* Mouth / Smile */}
              <path
                d="M 46.5 54.5 Q 50 57.5 50 52.8 Q 50 57.5 53.5 54.5"
                fill="none"
                stroke="#2E180B"
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Waving Right Arm / Paw */}
              <g
                className="animate-[wave_1.5s_infinite_ease-in-out_alternate]"
                style={{ transformOrigin: "67px 65px" }}
              >
                {/* Arm extending up and to the right */}
                <path
                  d="M 65 65 C 68 57 73 49 76 41 C 78 37 83 34 86 36 C 89 39 88 44 85 49 C 81 56 76 63 71 69 Z"
                  fill="#8D5524"
                />
                {/* Main Paw Pad */}
                <ellipse cx="82" cy="42" rx="3.6" ry="3.8" transform="rotate(-25 82 42)" fill="#F8DEC0" />
                {/* Toe Beans */}
                <circle cx="81.5" cy="36" r="1.1" fill="#F8DEC0" />
                <circle cx="84.5" cy="37.2" r="1.1" fill="#F8DEC0" />
                <circle cx="86.8" cy="40.2" r="1.1" fill="#F8DEC0" />
              </g>
            </svg>
          </div>

          {/* Green Online Status Dot with subtle pulse */}
          <span
            className="absolute bottom-0 right-0 flex size-3.5 pointer-events-none"
            title="Online"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#24a148] opacity-75" />
            <span
              className="relative inline-flex size-3.5 bg-[#24a148] border-2 border-white rounded-full"
            />
          </span>
        </div>
      </div>
    </aside>
  );
}

// Backward-compatible alias
export const FloatingTalkButton = FloatingSupportWidget;
