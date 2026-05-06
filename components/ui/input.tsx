import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-primary/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
