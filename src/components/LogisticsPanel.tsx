"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  requestId: string;
  status: string;
  pickupTime: string | null;
  pickupLocation: string | null;
  returnTime: string | null;
  returnLocation: string | null;
  requesterConfirmedAt: string | null;
  lenderConfirmedAt: string | null;
  isOwn: boolean;
};

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

export function LogisticsPanel(props: Props) {
  const router = useRouter();
  const hasAllDetails =
    props.pickupTime &&
    props.pickupLocation &&
    props.returnTime &&
    props.returnLocation;
  const [editing, setEditing] = useState(!hasAllDetails);
  const [pickupTime, setPickupTime] = useState(toDatetimeLocal(props.pickupTime));
  const [pickupLocation, setPickupLocation] = useState(props.pickupLocation ?? "");
  const [returnTime, setReturnTime] = useState(toDatetimeLocal(props.returnTime));
  const [returnLocation, setReturnLocation] = useState(props.returnLocation ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const myConfirmedAt = props.isOwn
    ? props.requesterConfirmedAt
    : props.lenderConfirmedAt;
  const otherConfirmedAt = props.isOwn
    ? props.lenderConfirmedAt
    : props.requesterConfirmedAt;

  const saveLogistics = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/requests/${props.requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateLogistics",
        pickupTime,
        pickupLocation,
        returnTime,
        returnLocation,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Speichern fehlgeschlagen.");
      return;
    }
    setEditing(false);
    router.refresh();
  };

  const confirm = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/requests/${props.requestId}/confirm`, {
      method: "POST",
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Bestätigung fehlgeschlagen.");
      return;
    }
    router.refresh();
  };

  const complete = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/requests/${props.requestId}/complete`, {
      method: "POST",
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Aktion fehlgeschlagen.");
      return;
    }
    router.refresh();
  };

  if (props.status === "COMPLETED") return null;

  return (
    <div className="flex flex-col gap-3 rounded border p-4">
      <h2 className="text-sm font-semibold">Abhol- &amp; Rückgabedetails</h2>

      {editing ? (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Abholzeit
            <input
              name="pickupTime"
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Abholort
            <input
              name="pickupLocation"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Rückgabezeit
            <input
              name="returnTime"
              type="datetime-local"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Rückgabeort
            <input
              name="returnLocation"
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </label>
          <button
            onClick={saveLogistics}
            disabled={loading}
            className="self-start rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Speichern
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1 text-sm">
          <p>
            Abholung: {new Date(props.pickupTime!).toLocaleString("de-DE")} ·{" "}
            {props.pickupLocation}
          </p>
          <p>
            Rückgabe: {new Date(props.returnTime!).toLocaleString("de-DE")} ·{" "}
            {props.returnLocation}
          </p>
          {props.status === "MATCHED" && (
            <button
              onClick={() => setEditing(true)}
              className="self-start text-xs underline"
            >
              Details ändern
            </button>
          )}
        </div>
      )}

      {props.status === "MATCHED" && !editing && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">
            {myConfirmedAt ? "Du hast bestätigt." : "Noch nicht bestätigt."}{" "}
            {otherConfirmedAt
              ? "Die andere Person hat bestätigt."
              : "Die andere Person hat noch nicht bestätigt."}
          </p>
          {!myConfirmedAt && (
            <button
              onClick={confirm}
              disabled={loading}
              className="self-start rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Details bestätigen
            </button>
          )}
        </div>
      )}

      {props.status === "CONFIRMED" && (
        <button
          onClick={complete}
          disabled={loading}
          className="self-start rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Als zurückgegeben markieren
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
