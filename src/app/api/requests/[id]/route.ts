import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patchRequestSchema } from "@/lib/validation/confirm";

export async function PATCH(
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

  const body = await request.json().catch(() => null);
  const parsed = patchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (parsed.data.action === "cancel") {
    if (!isOwn) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (
      lendingRequest.status === "COMPLETED" ||
      lendingRequest.status === "CANCELLED"
    ) {
      return NextResponse.json(
        { error: "Kann nicht mehr storniert werden" },
        { status: 409 }
      );
    }
    const updated = await prisma.lendingRequest.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  // updateLogistics: either participant may propose pickup/return details while MATCHED.
  if (!isOwn && !isLender) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (lendingRequest.status !== "MATCHED") {
    return NextResponse.json(
      { error: "Details können nur nach Vergabe bearbeitet werden" },
      { status: 409 }
    );
  }

  const updated = await prisma.lendingRequest.update({
    where: { id },
    data: {
      pickupTime: new Date(parsed.data.pickupTime),
      pickupLocation: parsed.data.pickupLocation,
      returnTime: new Date(parsed.data.returnTime),
      returnLocation: parsed.data.returnLocation,
      requesterConfirmedAt: null,
      lenderConfirmedAt: null,
    },
  });

  return NextResponse.json(updated);
}
