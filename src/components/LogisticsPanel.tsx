"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [loading, setLoading] = useState(false);

  const myConfirmedAt = props.isOwn
    ? props.requesterConfirmedAt
    : props.lenderConfirmedAt;
  const otherConfirmedAt = props.isOwn
    ? props.lenderConfirmedAt
    : props.requesterConfirmedAt;

  const saveLogistics = async () => {
    setLoading(true);
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
      toast.error(body?.error ?? "Speichern fehlgeschlagen.");
      return;
    }
    setEditing(false);
    router.refresh();
  };

  const confirm = async () => {
    setLoading(true);
    const res = await fetch(`/api/requests/${props.requestId}/confirm`, {
      method: "POST",
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Bestätigung fehlgeschlagen.");
      return;
    }
    router.refresh();
  };

  const complete = async () => {
    setLoading(true);
    const res = await fetch(`/api/requests/${props.requestId}/complete`, {
      method: "POST",
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Aktion fehlgeschlagen.");
      return;
    }
    router.refresh();
  };

  if (props.status === "COMPLETED") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Abhol- &amp; Rückgabedetails</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {editing ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pickupTime">Abholzeit</Label>
              <Input
                id="pickupTime"
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pickupLocation">Abholort</Label>
              <Input
                id="pickupLocation"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="returnTime">Rückgabezeit</Label>
              <Input
                id="returnTime"
                type="datetime-local"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="returnLocation">Rückgabeort</Label>
              <Input
                id="returnLocation"
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
              />
            </div>
            <Button onClick={saveLogistics} disabled={loading} className="self-start">
              Speichern
            </Button>
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
              <Button
                variant="link"
                className="h-auto self-start p-0 text-xs"
                onClick={() => setEditing(true)}
              >
                Details ändern
              </Button>
            )}
          </div>
        )}

        {props.status === "MATCHED" && !editing && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              {myConfirmedAt ? "Du hast bestätigt." : "Noch nicht bestätigt."}{" "}
              {otherConfirmedAt
                ? "Die andere Person hat bestätigt."
                : "Die andere Person hat noch nicht bestätigt."}
            </p>
            {!myConfirmedAt && (
              <Button onClick={confirm} disabled={loading} className="self-start">
                Details bestätigen
              </Button>
            )}
          </div>
        )}

        {props.status === "CONFIRMED" && (
          <Button onClick={complete} disabled={loading} className="self-start">
            Als zurückgegeben markieren
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
