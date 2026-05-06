import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <AuthForm mode="login" redirectTo={params.redirect ?? "/dashboard"} />
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link className="font-semibold text-primary" href="/register">
          Criar agora
        </Link>
      </p>
    </div>
  );
}
