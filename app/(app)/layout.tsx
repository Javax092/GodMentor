import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getSession } from "@/lib/auth";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
