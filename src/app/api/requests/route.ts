import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRequestSchema } from "@/lib/validation/request";
import { notifyNearbyUsers } from "@/lib/push";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const lendingRequest = await prisma.lendingRequest.create({
    data: {
      requesterId: session.user.id,
      text: parsed.data.text,
      photoUrl: parsed.data.photoUrl,
      city: session.user.city,
      postalCode: session.user.postalCode,
    },
  });

  await notifyNearbyUsers(lendingRequest).catch((err) =>
    console.error("Failed to send push notifications", err)
  );

  return NextResponse.json(lendingRequest, { status: 201 });
}
