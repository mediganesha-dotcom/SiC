"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string };
};

const POLL_INTERVAL_MS = 4000;

export function ChatPanel({
  requestId,
  currentUserId,
}: {
  requestId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const lastTimestamp = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const url = new URL(
        `/api/requests/${requestId}/messages`,
        window.location.origin
      );
      if (lastTimestamp.current) {
        url.searchParams.set("since", lastTimestamp.current);
      }
      const res = await fetch(url.toString());
      if (!res.ok || cancelled) return;
      const newMessages: Message[] = await res.json();
      if (newMessages.length > 0) {
        lastTimestamp.current = newMessages[newMessages.length - 1].createdAt;
        setMessages((prev) => [...prev, ...newMessages]);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [requestId]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const res = await fetch(`/api/requests/${requestId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    if (!res.ok) {
      toast.error("Nachricht konnte nicht gesendet werden.");
      return;
    }
    const message: Message = await res.json();
    lastTimestamp.current = message.createdAt;
    setMessages((prev) => [...prev, message]);
    setText("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Noch keine Nachrichten.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex max-w-[80%] flex-col",
                m.sender.id === currentUserId ? "self-end items-end" : "self-start"
              )}
            >
              <p className="text-xs text-muted-foreground">{m.sender.name}</p>
              <p
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm",
                  m.sender.id === currentUserId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {m.body}
              </p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Nachricht..."
            className="flex-1"
          />
          <Button onClick={send}>Senden</Button>
        </div>
      </CardContent>
    </Card>
  );
}
