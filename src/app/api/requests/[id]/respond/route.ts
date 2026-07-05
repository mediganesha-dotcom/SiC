import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { respondSchema } from "@/lib/validation/response";
import { Prisma } from "@/generated/prisma/client";
import { notifyMatch } from "@/lib/push";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: requestId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const userId = session.user.id;
  const { type } = parsed.data;

  const lendingRequest = await prisma.lendingRequest.findUnique({
    where: { id: requestId },
  });
  if (!lendingRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (lendingRequest.requesterId === userId) {
    return NextResponse.json(
      { error: "Du kannst nicht auf deine eigene Anfrage antworten" },
      { status: 403 }
    );
  }

  try {
    await prisma.requestResponse.create({ data: { requestId, userId, type } });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Du hast bereits geantwortet" },
        { status: 409 }
      );
    }
    throw e;
  }

  if (type === "DECLINE") {
    return NextResponse.json({ ok: true });
  }

  // Atomic conditional update: only succeeds for the first accepter while status is still OPEN.
  const result = await prisma.lendingRequest.updateMany({
    where: { id: requestId, status: "OPEN" },
    data: { status: "MATCHED", lenderId: userId, matchedAt: new Date() },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Anfrage wurde bereits vergeben" },
      { status: 409 }
    );
  }

  await notifyMatch({
    id: lendingRequest.id,
    text: lendingRequest.text,
    requesterId: lendingRequest.requesterId,
    lenderName: session.user.name ?? "Jemand",
  }).catch((err) => console.error("Failed to send match push notification", err));

  return NextResponse.json({ ok: true });
}
