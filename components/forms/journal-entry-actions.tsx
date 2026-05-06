"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { JournalForm } from "@/components/forms/journal-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function JournalEntryActions({ entry }: { entry: JournalEntry }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function removeEntry() {
    setLoading(true);
    await fetch(`/api/journal/${entry.id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <Pencil className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
          </DialogHeader>
          <JournalForm entry={entry} />
        </DialogContent>
      </Dialog>
      <Button disabled={loading} onClick={removeEntry} size="icon" variant="ghost">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
