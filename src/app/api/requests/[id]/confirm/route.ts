import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const lendingRequest = await prisma.lendingRequest.findUnique({ where: { id } });
  if (!lendingRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const isOwn = lendingRequest.requesterId === userId;
  const isLender = lendingRequest.lenderId === userId;
  if (!isOwn && !isLender) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (lendingRequest.status !== "MATCHED") {
    return NextResponse.json(
      { error: "Bestätigung ist erst nach Vergabe möglich" },
      { status: 409 }
    );
  }
  if (
    !lendingRequest.pickupTime ||
    !lendingRequest.pickupLocation ||
    !lendingRequest.returnTime ||
    !lendingRequest.returnLocation
  ) {
    return NextResponse.json(
      { error: "Bitte zuerst Abhol-/Rückgabedetails festlegen" },
      { status: 400 }
    );
  }

  await prisma.lendingRequest.update({
    where: { id },
    data: isOwn
      ? { requesterConfirmedAt: new Date() }
      : { lenderConfirmedAt: new Date() },
  });

  // Atomic transition: only flips once both sides have confirmed.
  await prisma.lendingRequest.updateMany({
    where: {
      id,
      status: "MATCHED",
      requesterConfirmedAt: { not: null },
      lenderConfirmedAt: { not: null },
    },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });

  const updated = await prisma.lendingRequest.findUniqueOrThrow({ where: { id } });
  return NextResponse.json(updated);
}
