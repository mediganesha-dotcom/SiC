import Link from "next/link";
import type { LendingRequest } from "@/generated/prisma/client";
import { STATUS_LABELS, STATUS_BADGE_CLASSES } from "@/lib/requestStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ChatListCard({
  request,
  otherPersonName,
}: {
  request: LendingRequest;
  otherPersonName: string;
}) {
  return (
    <Link href={`/requests/${request.id}`}>
      <Card className="gap-2 py-3 transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm font-medium">Chat mit {otherPersonName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {request.text}
            </p>
          </div>
          <Badge className={STATUS_BADGE_CLASSES[request.status]}>
            {STATUS_LABELS[request.status] ?? request.status}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
