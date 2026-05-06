"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GenerateInsightButton({ endpoint }: { endpoint: "/api/ai/insight" | "/api/ai/weekly-review" | "/api/ai/monthly-review" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    await fetch(endpoint, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button className="gap-2" disabled={loading} onClick={generate} variant="secondary">
      <Sparkles className="size-4" />
      {loading ? "Gerando..." : "Atualizar insight"}
    </Button>
  );
}
