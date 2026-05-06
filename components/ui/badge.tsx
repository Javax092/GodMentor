import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.14em] uppercase", {
  variants: {
    variant: {
      default: "border-primary/24 bg-primary/10 text-primary",
      secondary: "border-white/8 bg-secondary text-secondary-foreground",
      success: "border-emerald-500/20 bg-emerald-500/12 text-emerald-300",
      warning: "border-amber-500/20 bg-amber-500/12 text-amber-300",
      danger: "border-rose-500/20 bg-rose-500/12 text-rose-300"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
