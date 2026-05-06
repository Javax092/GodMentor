import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <AuthForm mode="register" />
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link className="font-semibold text-primary" href="/login">
          Entrar
        </Link>
      </p>
    </div>
  );
}
