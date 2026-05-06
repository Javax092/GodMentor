import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StatusPanelProps = {
  eyebrow: string;
  title: string;
  value: string;
  tone?: "default" | "secondary" | "success" | "warning" | "danger";
  message: string;
  actionLabel: string;
  href: string;
};

export function StatusPanel({ eyebrow, title, value, tone = "default", message, actionLabel, href }: StatusPanelProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="truncate text-2xl font-semibold tracking-[-0.05em] text-foreground md:text-3xl">{value}</p>
            </div>
          </div>
          <Badge className="w-fit" variant={tone}>
            {value}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        <Button asChild className="w-full justify-between" variant="outline">
          <Link href={href}>
            {actionLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
