import Link from "next/link";
import { Logo } from "@/components/app/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="safe-top safe-bottom safe-x grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-10">{children}</div>
      <div className="hidden border-l border-white/6 bg-[#0b0d11] p-8 text-white lg:flex lg:flex-col">
        <Logo />
        <div className="m-auto max-w-lg space-y-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Evolução inteligente</p>
          <h1 className="text-6xl font-semibold leading-tight tracking-[-0.05em]">
            Clareza diária para avançar sem ruído.
          </h1>
          <p className="text-lg leading-8 text-slate-300">
            Diário, metas, revisões e base para mentor IA em um produto pronto para operar como SaaS.
          </p>
        </div>
        <Link href="/" className="text-sm text-slate-300 underline underline-offset-4">
          Voltar para a landing page
        </Link>
      </div>
    </div>
  );
}
