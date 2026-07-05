import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/lib/validation/message";

async function assertChatParticipant(requestId: string, userId: string) {
  const lendingRequest = await prisma.lendingRequest.findUnique({
    where: { id: requestId },
  });
  if (!lendingRequest) return null;
  if (!lendingRequest.lenderId) return null; // chat only exists once matched
  const isParticipant =
    lendingRequest.requesterId === userId || lendingRequest.lenderId === userId;
  if (!isParticipant) return null;
  return lendingRequest;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: requestId } = await params;
  const lendingRequest = await assertChatParticipant(requestId, session.user.id);
  if (!lendingRequest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since = new URL(request.url).searchParams.get("since");

  const messages = await prisma.chatMessage.findMany({
    where: {
      requestId,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: requestId } = await params;
  const lendingRequest = await assertChatParticipant(requestId, session.user.id);
  if (!lendingRequest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      requestId,
      senderId: session.user.id,
      body: parsed.data.body,
    },
    include: { sender: { select: { id: true, name: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
