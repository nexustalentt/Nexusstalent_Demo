import React from "react";

interface NexusLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  showText?: boolean;
}

export function NexusLogo({
  size = 32,
  className = "",
  showText = true,
  ...props
}: NexusLogoProps) {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${className}`}
      aria-label="Nexus Talent Logo"
      role="img"
      {...props}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="nl-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b1b36" />
          <stop offset="45%" stop-color="#061224" />
          <stop offset="100%" stop-color="#020814" />
        </linearGradient>

        {/* Border Gradient */}
        <linearGradient id="nl-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
          <stop offset="50%" stop-color="#0284c7" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.6" />
        </linearGradient>

        {/* Vibrant Cyan / Blue Gradient for N */}
        <linearGradient id="nl-cyan-grad" x1="15%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="35%" stop-color="#00D2FF" />
          <stop offset="70%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>

        {/* Radial Center Glow */}
        <radialGradient id="nl-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#00D2FF" stop-opacity="0.3" />
          <stop offset="60%" stop-color="#0284c7" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>

        {/* Drop Shadow / Glow Filter */}
        <filter id="nl-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3.5"
            flood-color="#00D2FF"
            flood-opacity="0.4"
          />
        </filter>
      </defs>

      {/* Rounded Background Box */}
      <rect
        x="2.5"
        y="2.5"
        width="115"
        height="115"
        rx="26"
        fill="url(#nl-bg)"
        stroke="url(#nl-border)"
        stroke-width="1.8"
      />

      {/* Ambient Glow Behind Monogram */}
      <circle cx="60" cy="48" r="42" fill="url(#nl-glow)" />

      {/* The "N" Monogram */}
      <g filter="url(#nl-shadow)">
        <path
          d="M 28 78 L 28 26 C 28 24.3 29.3 23 31 23 L 42 23 C 43.4 23 44.6 23.9 45 25.2 L 75 64.5 L 75 26 C 75 24.3 76.3 23 78 23 L 89 23 C 90.7 23 92 24.3 92 26 L 92 78 C 92 79.7 90.7 81 89 81 L 78 81 C 76.6 81 75.4 80.1 75 78.8 L 45 39.5 L 45 78 C 45 79.7 43.7 81 42 81 L 31 81 C 29.3 81 28 79.7 28 78 Z"
          fill="url(#nl-cyan-grad)"
        />
        {/* Subtle diagonal specular highlight for dimensional depth */}
        <path
          d="M 43 27 L 77 71"
          stroke="#ffffff"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-opacity="0.5"
        />
      </g>

      {/* NEXUS TALENT text (shown when space permits) */}
      {showText && (
        <text
          x="60"
          y="102"
          text-anchor="middle"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          font-size="9"
          font-weight="800"
          letter-spacing="2"
          fill="#f0f9ff"
        >
          NEXUS TALENT
        </text>
      )}
    </svg>
  );
}

export function NexusLogoNavIcon({ className = "size-4" }: { className?: string }) {
  return <NexusLogo size={18} showText={false} className={`rounded ${className}`} />;
}
