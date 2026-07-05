import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type PushPayload = {
  title: string;
  body: string;
  requestId: string;
};

async function sendToUser(userId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });
  const json = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        } else {
          console.error("web-push send failed", err);
        }
      }
    })
  );
}

export async function notifyNearbyUsers(request: {
  id: string;
  text: string;
  city: string;
  postalCode: string;
  requesterId: string;
}) {
  const recipients = await prisma.user.findMany({
    where: {
      id: { not: request.requesterId },
      OR: [{ city: request.city }, { postalCode: request.postalCode }],
    },
    select: { id: true },
  });

  const payload: PushPayload = {
    title: "Neue Anfrage in deiner Nähe",
    body: request.text.slice(0, 100),
    requestId: request.id,
  };

  await Promise.allSettled(
    recipients.map((user) => sendToUser(user.id, payload))
  );
}

export async function notifyMatch(request: {
  id: string;
  text: string;
  requesterId: string;
  lenderName: string;
}) {
  await sendToUser(request.requesterId, {
    title: "Deine Anfrage wurde angenommen",
    body: `${request.lenderName} hilft dir: ${request.text.slice(0, 80)}`,
    requestId: request.id,
  });
}
