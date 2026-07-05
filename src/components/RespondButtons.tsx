"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RespondButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"ACCEPT" | "DECLINE" | null>(null);

  const respond = async (type: "ACCEPT" | "DECLINE") => {
    setLoading(type);
    setError(null);
    const res = await fetch(`/api/requests/${requestId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setLoading(null);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Aktion fehlgeschlagen.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => respond("ACCEPT")}
          disabled={loading !== null}
          className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Annehmen
        </button>
        <button
          onClick={() => respond("DECLINE")}
          disabled={loading !== null}
          className="rounded border px-3 py-2 text-sm disabled:opacity-50"
        >
          Ablehnen
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
