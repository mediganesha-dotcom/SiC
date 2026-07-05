import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/requestStatus";
import { RespondButtons } from "@/components/RespondButtons";
import { ChatPanel } from "@/components/ChatPanel";
import { LogisticsPanel } from "@/components/LogisticsPanel";
import { RatingForm } from "@/components/RatingForm";
import { CancelButton } from "@/components/CancelButton";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const lendingRequest = await prisma.lendingRequest.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true } },
      lender: { select: { id: true, name: true } },
    },
  });

  if (!lendingRequest) notFound();

  const isOwn = lendingRequest.requesterId === userId;
  const isLender = lendingRequest.lenderId === userId;

  const myResponse = isOwn
    ? null
    : await prisma.requestResponse.findUnique({
        where: { requestId_userId: { requestId: id, userId } },
      });

  const canRespond = !isOwn && lendingRequest.status === "OPEN" && !myResponse;
  const canChat = (isOwn || isLender) && lendingRequest.lenderId !== null;
  const canCancel =
    isOwn && (lendingRequest.status === "OPEN" || lendingRequest.status === "MATCHED");

  const myRating =
    lendingRequest.status === "COMPLETED" && (isOwn || isLender)
      ? await prisma.rating.findUnique({
          where: { requestId_authorId: { requestId: id, authorId: userId } },
        })
      : null;
  const canRate =
    lendingRequest.status === "COMPLETED" && (isOwn || isLender) && !myRating;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Anfrage</h1>
        <span className="text-xs font-medium uppercase text-gray-500">
          {STATUS_LABELS[lendingRequest.status] ?? lendingRequest.status}
        </span>
      </div>
      {lendingRequest.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lendingRequest.photoUrl}
          alt=""
          className="max-h-80 w-full rounded object-cover"
        />
      )}
      <p>{lendingRequest.text}</p>
      <p className="text-sm text-gray-500">
        von {lendingRequest.requester.name} · {lendingRequest.city},{" "}
        {lendingRequest.postalCode}
      </p>
      {isOwn && (
        <p className="text-xs text-gray-400">Das ist deine eigene Anfrage.</p>
      )}
      {lendingRequest.lender && (
        <p className="text-sm text-gray-500">
          Vergeben an {lendingRequest.lender.name}
        </p>
      )}
      {myResponse?.type === "DECLINE" && (
        <p className="text-xs text-gray-400">Du hast diese Anfrage abgelehnt.</p>
      )}
      {canRespond && <RespondButtons requestId={lendingRequest.id} />}
      {canCancel && <CancelButton requestId={lendingRequest.id} />}
      {canChat && (
        <LogisticsPanel
          requestId={lendingRequest.id}
          status={lendingRequest.status}
          pickupTime={lendingRequest.pickupTime?.toISOString() ?? null}
          pickupLocation={lendingRequest.pickupLocation}
          returnTime={lendingRequest.returnTime?.toISOString() ?? null}
          returnLocation={lendingRequest.returnLocation}
          requesterConfirmedAt={
            lendingRequest.requesterConfirmedAt?.toISOString() ?? null
          }
          lenderConfirmedAt={lendingRequest.lenderConfirmedAt?.toISOString() ?? null}
          isOwn={isOwn}
        />
      )}
      {canRate && <RatingForm requestId={lendingRequest.id} />}
      {canChat && (
        <ChatPanel requestId={lendingRequest.id} currentUserId={userId} />
      )}
    </div>
  );
}
