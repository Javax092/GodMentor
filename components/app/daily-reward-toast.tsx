"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

export function DailyRewardToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 1200);
    const hide = window.setTimeout(() => setVisible(false), 6200);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(hide);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-50 max-w-sm rounded-[24px] border border-cyan-400/20 bg-[#09131b]/90 p-4 shadow-soft backdrop-blur-2xl">
      <p className="flex items-center gap-2 text-sm font-medium text-white">
        <Gift className="size-4 text-cyan-200" />
        Recompensa diária pronta
      </p>
      <p className="mt-1 text-sm text-slate-300">Conclua a primeira missão do dia para ativar o bônus de ritmo.</p>
    </div>
  );
}
