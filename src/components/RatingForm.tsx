"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RatingForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await fetch(`/api/requests/${requestId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, comment: comment || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Bewertung fehlgeschlagen.");
      return;
    }
    setSubmitted(true);
    router.refresh();
  };

  if (submitted) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Danke für deine Bewertung!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Bewertung abgeben</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              aria-label={`${n} Sterne`}
            >
              <Star
                className={cn(
                  "size-6",
                  n <= stars
                    ? "fill-primary text-primary"
                    : "fill-none text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Kommentar (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <Button onClick={submit} disabled={loading} className="self-start">
          Absenden
        </Button>
      </CardContent>
    </Card>
  );
}
