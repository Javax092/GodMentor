"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type PrepareMissionsButtonProps = ButtonProps & {
  redirectTo?: string;
  idleLabel?: string;
  loadingLabel?: string;
  successLabel?: string;
};

export function PrepareMissionsButton({
  redirectTo = "/missoes",
  idleLabel = "Preparar missões de hoje",
  loadingLabel = "Preparando missões...",
  successLabel = "Missões prontas",
  ...props
}: PrepareMissionsButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handlePrepare() {
    setLoading(true);
    setDone(false);

    const response = await fetch("/api/missions/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setLoading(false);
      showToast({
        tone: "error",
        title: "Não foi possível preparar o plano de hoje",
        description: data?.error ?? "Tente novamente em instantes."
      });
      return;
    }

    setDone(true);
    setLoading(false);
    showToast({
      tone: "success",
      title: data?.created ? "Missões preparadas" : "Missões já disponíveis",
      description: data?.message ?? "Seu plano de hoje já está pronto."
    });
    router.refresh();
    router.push(redirectTo);
  }

  return (
    <Button {...props} disabled={loading || props.disabled} onClick={handlePrepare}>
      {loading ? <Spinner /> : done ? <CheckCircle2 className="size-4" /> : <Sparkles className="size-4" />}
      {loading ? loadingLabel : done ? successLabel : idleLabel}
    </Button>
  );
}
