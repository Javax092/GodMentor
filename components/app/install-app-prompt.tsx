"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_STORAGE_KEY = "evolua-install-dismissed-at";
const INSTALLED_STORAGE_KEY = "evolua-install-complete";
const DISMISS_TTL = 1000 * 60 * 60 * 24 * 7;

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateInstallState = () => {
      const standalone = isStandaloneMode();
      const installedFlag = window.localStorage.getItem(INSTALLED_STORAGE_KEY) === "true";
      setInstalled(standalone || installedFlag);
    };

    updateInstallState();

    if (isStandaloneMode()) {
      return;
    }

    const lastDismissed = Number(window.localStorage.getItem(DISMISS_STORAGE_KEY) ?? "0");
    setDismissed(Date.now() - lastDismissed < DISMISS_TTL);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setDismissed(true);
      window.localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
      window.localStorage.removeItem(DISMISS_STORAGE_KEY);
      updateInstallState();
    };

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = () => updateInstallState();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  async function onInstall() {
    if (!deferredPrompt) {
      return;
    }

    setLoading(true);
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setLoading(false);

    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      return;
    }

    dismissPrompt();
  }

  function dismissPrompt() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    }
    setDismissed(true);
  }

  const visible = Boolean(deferredPrompt) && !dismissed && !installed;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-4 bottom-28 z-30 lg:hidden"
          exit={{ opacity: 0, y: 12 }}
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="rounded-[26px] border border-white/10 bg-[#0d1520]/94 p-4 shadow-soft backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-2xl border border-primary/15 bg-primary/[0.12] p-2.5">
                  <Smartphone className="size-4 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">Adicionar à tela inicial</p>
                  <p className="text-sm leading-5 text-slate-300">Abertura instantânea, layout limpo e sem repetir esse aviso.</p>
                </div>
              </div>
              <button
                aria-label="Fechar aviso de instalação"
                className="rounded-full border border-white/10 p-2 text-muted-foreground transition hover:text-foreground"
                type="button"
                onClick={dismissPrompt}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 gap-2" type="button" onClick={onInstall}>
                <Download className="size-4" />
                {loading ? "Abrindo..." : "Instalar"}
              </Button>
              <Button className="px-4" type="button" variant="ghost" onClick={dismissPrompt}>
                Agora não
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
