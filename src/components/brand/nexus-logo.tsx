import React from "react";

export interface NexusLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
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

  if (showText) {
    return (
      <img
        src="/brand/nexus-talent-logo.png"
        alt="Nexus Talent — Connecting Potential, Inspiring Success"
        style={{ height: dimension, width: "auto" }}
        className={`inline-block shrink-0 select-none object-contain ${className}`}
        loading="eager"
        {...props}
      />
    );
  }

  return (
    <img
      src="/brand/nexus-talent-icon.png"
      alt="Nexus Talent"
      style={{ width: dimension, height: dimension }}
      className={`inline-block shrink-0 select-none object-contain ${className}`}
      loading="eager"
      {...props}
    />
  );
}

export function NexusLogoNavIcon({ className = "size-4" }: { className?: string }) {
  return (
    <img
      src="/brand/nexus-talent-icon.png"
      alt=""
      aria-hidden="true"
      className={`inline-block shrink-0 select-none object-contain ${className}`}
      loading="eager"
    />
  );
}

export function NexusFullBrandLogo({
  className = "h-10 w-auto",
  alt = "Nexus Talent — Connecting Potential, Inspiring Success",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/brand/nexus-talent-logo.png"
      alt={alt}
      className={`inline-block select-none object-contain ${className}`}
      loading="eager"
    />
  );
}
