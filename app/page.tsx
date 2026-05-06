import Link from "next/link";
import { ArrowRight, BrainCircuit, CalendarDays, CheckCircle2, Gauge, Sparkles, Target } from "lucide-react";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: CalendarDays,
    title: "Diário guiado",
    description: "Registre vitórias, desafios, humor e prioridade seguinte com estrutura que gera clareza."
  },
  {
    icon: Target,
    title: "Metas acionáveis",
    description: "Acompanhe objetivos diários, semanais e mensais com progresso real e priorização."
  },
  {
    icon: BrainCircuit,
    title: "Mentor com IA",
    description: "Receba leituras práticas sobre padrões, riscos e sugestões concretas de foco."
  },
  {
    icon: Gauge,
    title: "Painel de evolução",
    description: "Veja sequência de consistência, nota média, metas concluídas e avanço mensal."
  }
];

const benefits = [
  "Transforma reflexão em execução com um check-in diário objetivo.",
  "Conecta metas, humor, revisões e aprendizados em uma visão única.",
  "Cria uma base pronta para coaching assistido por IA sem depender disso para funcionar."
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
            Entrar
          </Link>
          <Button asChild>
            <Link href="/register">Criar conta</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <section className="panel-grid overflow-hidden rounded-[40px] border border-white/8 bg-card/72 px-6 py-14 shadow-soft backdrop-blur-xl md:px-12 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                Clareza diária para crescimento consistente
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-[-0.06em] text-foreground md:text-7xl">
                  Evolução pessoal com cara de software sério.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Um diário inteligente para acompanhar metas, registrar aprendizados e evoluir na vida pessoal e
                  profissional com clareza.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">
                    Criar conta
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#como-funciona">Como funciona</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-muted-foreground">
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-white/8 bg-[#0b0e13] text-white">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Visão da semana</p>
                    <p className="text-3xl font-semibold">82% de tração</p>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/12 p-3">
                    <Sparkles className="size-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-4 rounded-[28px] border border-white/6 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span>Meta principal</span>
                    <span className="font-semibold">Estratégia comercial</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-4/5 rounded-full bg-primary" />
                  </div>
                  <div className="grid gap-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <span>Streak atual</span>
                      <span className="font-semibold text-white">14 dias</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <span>Nota média</span>
                      <span className="font-semibold text-white">8.4/10</span>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-blue-100">
                      Você rende melhor quando encerra o dia com uma prioridade única para amanhã.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16" id="como-funciona">
          <div className="mb-8 max-w-2xl space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Como funciona</p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
              Um sistema simples para evoluir com intenção.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              "Defina metas por período e prioridade.",
              "Registre seu dia com check-ins curtos e consistentes.",
              "Use revisões semanais e mensais para ajustar foco."
            ].map((step, index) => (
              <Card key={step}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/12 text-lg font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p className="text-lg font-semibold tracking-tight text-foreground">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="mb-8 max-w-2xl space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Funcionalidades</p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
              Feito para virar rotina, não só um app bonito.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="space-y-5 p-6">
                    <div className="inline-flex rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">{feature.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <Card>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Preço</p>
                  <h2 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                    Estrutura de SaaS pronta para começar simples e crescer rápido.
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
                    <p className="text-lg font-semibold text-foreground">Plano Starter</p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">R$ 29</p>
                    <p className="text-sm text-muted-foreground">por mês, por usuário</p>
                  </div>
                  <div className="rounded-[28px] border border-primary/20 bg-primary/10 p-6">
                    <p className="text-lg font-semibold text-foreground">Inclui</p>
                    <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                      {[
                        "Diário, metas e revisões completas",
                        "Dashboard com progresso e histórico",
                        "Base pronta para mentor IA"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/14 bg-[#0b0e13] text-white">
              <CardContent className="space-y-5 p-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Comece agora</p>
                <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                  Centralize sua evolução pessoal e profissional em um único sistema.
                </h3>
                <p className="text-sm leading-7 text-slate-300">
                  Crie sua conta, registre o primeiro dia e comece a construir histórico para decisões melhores.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link href="/register">Criar conta</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
