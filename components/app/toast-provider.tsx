"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (input: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, tone }: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, title, description, tone }]);
      window.setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-3 md:bottom-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <AnimatePresence initial={false}>
            {toasts.map((toast) => {
              const Icon = toast.tone === "success" ? CheckCircle2 : AlertCircle;

              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={cn(
                    "pointer-events-auto rounded-[24px] border px-4 py-4 shadow-2xl backdrop-blur",
                    toast.tone === "success"
                      ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-50"
                      : "border-rose-400/20 bg-rose-500/15 text-rose-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-black/20 p-2">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{toast.title}</p>
                      {toast.description ? <p className="mt-1 text-sm text-white/80">{toast.description}</p> : null}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-9 rounded-full text-current hover:bg-black/10"
                      onClick={() => dismissToast(toast.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
