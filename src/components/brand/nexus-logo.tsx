import React from "react";

interface NexusLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  showText?: boolean;
}

export function NexusLogo({
  size = 32,
  className = "",
  showText = false,
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
      {/* Carbon flat-square base tile */}
      <rect x="0" y="0" width="120" height="120" fill="#161616" />

      {/* 1px Carbon accent hairline on right and bottom */}
      <rect x="0" y="116" width="120" height="4" fill="#0f62fe" />

      {/* Precise Geometric "N" Monogram in IBM Blue */}
      <path
        d="M 28 88 L 28 32 L 44 32 L 76 72 L 76 32 L 92 32 L 92 88 L 76 88 L 44 48 L 44 88 Z"
        fill="#0f62fe"
      />

      {/* Horizontal precision raster line across center in white */}
      <line x1="28" y1="60" x2="92" y2="60" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.4" />

      {showText && (
        <text
          x="60"
          y="106"
          textAnchor="middle"
          fontFamily="'IBM Plex Sans', -apple-system, sans-serif"
          fontSize="9"
          fontWeight="500"
          letterSpacing="1.5"
          fill="#ffffff"
        >
          NEXUS
        </text>
      )}
    </svg>
  );
}

export function NexusLogoNavIcon({ className = "size-4" }: { className?: string }) {
  return <NexusLogo size={18} showText={false} className={className} />;
}
