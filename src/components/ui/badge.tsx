import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2.5 py-1 text-xs font-normal tracking-[0.16px] transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#0f62fe] text-white",
        secondary: "border-[#e0e0e0] bg-[#f4f4f4] text-[#161616]",
        destructive: "border-transparent bg-[#da1e28] text-white",
        outline: "border-[#e0e0e0] text-[#161616] bg-transparent",
        accent: "border-[#0f62fe]/20 bg-[#edf5ff] text-[#0f62fe]",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
