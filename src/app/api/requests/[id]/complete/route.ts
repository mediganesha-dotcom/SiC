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
  const isParticipant =
    lendingRequest.requesterId === userId || lendingRequest.lenderId === userId;
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await prisma.lendingRequest.updateMany({
    where: { id, status: "CONFIRMED" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Kann nicht abgeschlossen werden" },
      { status: 409 }
    );
  }

  const updated = await prisma.lendingRequest.findUniqueOrThrow({ where: { id } });
  return NextResponse.json(updated);
}
