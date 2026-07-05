"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RespondButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"ACCEPT" | "DECLINE" | null>(null);

  const respond = async (type: "ACCEPT" | "DECLINE") => {
    setLoading(type);
    const res = await fetch(`/api/requests/${requestId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setLoading(null);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Aktion fehlgeschlagen.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => respond("ACCEPT")} disabled={loading !== null}>
        Annehmen
      </Button>
      <Button
        variant="outline"
        onClick={() => respond("DECLINE")}
        disabled={loading !== null}
      >
        Ablehnen
      </Button>
    </div>
  );
}
