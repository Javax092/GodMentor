"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DailyRewardToast } from "@/components/app/daily-reward-toast";
import { InstallAppPrompt } from "@/components/app/install-app-prompt";
import { MobileNav } from "@/components/app/mobile-nav";
import { Sidebar } from "@/components/app/sidebar";
import { ToastProvider } from "@/components/app/toast-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <ToastProvider>
      <div className="safe-top safe-bottom safe-x min-h-dvh px-3 py-3 md:px-6 md:py-6">
        <div className="mx-auto flex max-w-[1560px] gap-4 xl:gap-6">
          <Sidebar />
          <AnimatePresence initial={false} mode="wait">
            <motion.main
              key={pathname}
              animate={{ opacity: 1, y: 0 }}
              className="min-w-0 flex-1 pb-[10.5rem] xl:pb-8"
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
        <InstallAppPrompt />
        <DailyRewardToast />
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
