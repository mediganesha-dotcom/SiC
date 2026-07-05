"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RatingForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/requests/${requestId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, comment: comment || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Bewertung fehlgeschlagen.");
      return;
    }
    setSubmitted(true);
    router.refresh();
  };

  if (submitted) {
    return <p className="text-sm text-gray-500">Danke für deine Bewertung!</p>;
  }

  return (
    <div className="flex flex-col gap-2 rounded border p-4">
      <h2 className="text-sm font-semibold">Bewertung abgeben</h2>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setStars(n)}
            className={`text-2xl ${n <= stars ? "text-yellow-500" : "text-gray-300"}`}
            aria-label={`${n} Sterne`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Kommentar (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="rounded border px-3 py-2 text-sm"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="self-start rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        Absenden
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
