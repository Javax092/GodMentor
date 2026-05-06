import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ boxShadow: "0 0 24px rgba(96,165,250,0.35)", width: `${value}%` }}
      />
    </div>
  );
}
