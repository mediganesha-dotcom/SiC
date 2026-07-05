import Link from "next/link";
import type { LendingRequest } from "@/generated/prisma/client";
import { STATUS_LABELS } from "@/lib/requestStatus";

export function RequestCard({
  request,
  requesterName,
}: {
  request: LendingRequest;
  requesterName?: string;
}) {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="flex flex-col gap-1 rounded border p-4 hover:bg-gray-50"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-gray-500">
          {STATUS_LABELS[request.status] ?? request.status}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(request.createdAt).toLocaleDateString("de-DE")}
        </span>
      </div>
      {request.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={request.photoUrl}
          alt=""
          className="h-32 w-full rounded object-cover"
        />
      )}
      <p>{request.text}</p>
      {requesterName && (
        <p className="text-xs text-gray-500">von {requesterName}</p>
      )}
    </Link>
  );
}
