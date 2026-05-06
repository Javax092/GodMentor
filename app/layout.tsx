import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";
import { PWAProvider } from "@/components/app/pwa-provider";

export const metadata: Metadata = {
  title: `${APP_NAME} | Progresso diário com IA`,
  description: "Sistema premium de progresso diário com missões, streak, XP, mentor IA e revisão semanal.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME
  },
  icons: {
    icon: [
      { url: "/pwa-icons/192", sizes: "192x192", type: "image/png" },
      { url: "/pwa-icons/512", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#09111a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="overflow-x-hidden">
        <PWAProvider />
        {children}
      </body>
    </html>
  );
}
