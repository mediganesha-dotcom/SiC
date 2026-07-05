"use client";

import { useEffect, useRef, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    const res = await fetch(`/api/requests/${requestId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    if (!res.ok) {
      setError("Nachricht konnte nicht gesendet werden.");
      return;
    }
    const message: Message = await res.json();
    lastTimestamp.current = message.createdAt;
    setMessages((prev) => [...prev, message]);
    setText("");
  };

  return (
    <div className="flex flex-col gap-3 rounded border p-4">
      <h2 className="text-sm font-semibold">Chat</h2>
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">Noch keine Nachrichten.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.sender.id === currentUserId ? "self-end text-right" : "self-start"
            }
          >
            <p className="text-xs text-gray-400">{m.sender.name}</p>
            <p className="rounded bg-gray-100 px-3 py-1 text-sm">{m.body}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Nachricht..."
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          onClick={send}
          className="rounded bg-black px-3 py-2 text-sm text-white"
        >
          Senden
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
