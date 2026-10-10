import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-none border-0 border-b border-border bg-[#f4f4f4] px-4 py-2.5 text-sm text-[#161616] transition-colors placeholder:text-[#8c8c8c] focus-visible:outline-none focus-visible:border-b-2 focus-visible:border-b-[#0f62fe] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#e0e0e0]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
