import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ratingSchema } from "@/lib/validation/rating";
import { Prisma } from "@/generated/prisma/client";

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
  if (lendingRequest.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Bewertung erst nach Abschluss möglich" },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const subjectId = isOwn ? lendingRequest.lenderId! : lendingRequest.requesterId;

  try {
    const rating = await prisma.rating.create({
      data: {
        requestId: id,
        authorId: userId,
        subjectId,
        stars: parsed.data.stars,
        comment: parsed.data.comment,
      },
    });
    return NextResponse.json(rating, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Du hast bereits bewertet" }, { status: 409 });
    }
    throw e;
  }
}
