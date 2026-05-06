"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { appNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-80 shrink-0 xl:block">
      <div className="surface sticky top-6 flex min-h-[calc(100dvh-3rem)] flex-col overflow-hidden border-white/10 p-5">
        <div className="absolute inset-x-10 top-0 h-36 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <Logo />
          <div className="mt-8 rounded-[28px] border border-cyan-400/15 bg-cyan-400/[0.08] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Controle diário</p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">
              Abra o app e saiba exatamente o que fazer hoje.
            </p>
          </div>
          <nav className="mt-5 space-y-1.5">
            {appNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "border-cyan-400/20 bg-cyan-400/10 text-white"
                      : "border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.03] hover:text-white"
                  )}
                >
                  <Icon className={cn("size-5", active ? "text-cyan-200" : "text-slate-500")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm leading-6 text-slate-300">
            Streak, XP, mentor IA e review semanal trabalham como um único sistema.
          </p>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" className="w-full justify-start gap-2">
              <LogOut className="size-4" />
              Sair
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
