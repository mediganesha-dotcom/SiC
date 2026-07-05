"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    if (!window.confirm("Anfrage wirklich stornieren?")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Stornierung fehlgeschlagen.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={cancel}
        disabled={loading}
        className="self-start rounded border px-3 py-2 text-sm text-red-600 disabled:opacity-50"
      >
        Anfrage stornieren
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
