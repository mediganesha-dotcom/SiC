import Link from "next/link";
import type { LendingRequest } from "@/generated/prisma/client";
import { STATUS_LABELS, STATUS_BADGE_CLASSES } from "@/lib/requestStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RequestCard({
  request,
  requesterName,
}: {
  request: LendingRequest;
  requesterName?: string;
}) {
  return (
    <Link href={`/requests/${request.id}`}>
      <Card className="gap-3 py-4 transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Badge className={STATUS_BADGE_CLASSES[request.status]}>
              {STATUS_LABELS[request.status] ?? request.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(request.createdAt).toLocaleDateString("de-DE")}
            </span>
          </div>
          {request.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={request.photoUrl}
              alt=""
              className="h-32 w-full rounded-lg object-cover"
            />
          )}
          <p className="text-sm">{request.text}</p>
          {requesterName && (
            <p className="text-xs text-muted-foreground">von {requesterName}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
