"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { appNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const mobileItems = appNavItems.slice(0, 5);

  return (
    <nav className="safe-bottom fixed inset-x-3 bottom-3 z-40 rounded-[30px] border border-white/10 bg-[#0b1118]/90 px-2 pb-[calc(0.55rem+var(--safe-bottom))] pt-2 shadow-soft backdrop-blur-2xl lg:hidden">
      <div className="grid grid-cols-5 gap-1.5">
        {mobileItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-[22px] border px-1.5 py-2 text-center text-[10px] font-medium",
                active ? "border-cyan-400/20 text-white" : "border-transparent text-slate-400"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-[22px] border border-cyan-400/20 bg-cyan-400/10"
                  transition={{ duration: 0.2 }}
                />
              ) : null}
              <Icon className={cn("relative z-10 size-4", active ? "text-cyan-200" : "text-slate-500")} />
              <span className="relative z-10">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
