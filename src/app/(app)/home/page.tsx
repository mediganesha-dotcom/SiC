import Link from "next/link";
import { PackageSearch, ListChecks, MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestCard } from "@/components/RequestCard";
import { ChatListCard } from "@/components/ChatListCard";
import { StatTile } from "@/components/StatTile";
import { EmptyState } from "@/components/EmptyState";
import { buttonVariants } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  const userId = session!.user.id;
  const { city, postalCode } = session!.user;

  const [nearbyOpenCount, myActiveRequests, openChats] = await Promise.all([
    prisma.lendingRequest.count({
      where: {
        status: "OPEN",
        requesterId: { not: userId },
        OR: [{ city }, { postalCode }],
        NOT: { responses: { some: { userId } } },
      },
    }),
    prisma.lendingRequest.findMany({
      where: {
        requesterId: userId,
        status: { in: ["OPEN", "MATCHED", "CONFIRMED"] },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lendingRequest.findMany({
      where: {
        OR: [{ requesterId: userId }, { lenderId: userId }],
        status: { in: ["MATCHED", "CONFIRMED"] },
      },
      include: {
        requester: { select: { id: true, name: true } },
        lender: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          Willkommen zurück, {session!.user.name}
        </h1>
        <Link href="/requests/new" className={buttonVariants()}>
          Neue Anfrage
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatTile
          label="Offen in der Nähe"
          value={nearbyOpenCount}
          icon={PackageSearch}
        />
        <StatTile
          label="Aktive Anfragen"
          value={myActiveRequests.length}
          icon={ListChecks}
        />
        <StatTile
          label="Offene Chats"
          value={openChats.length}
          icon={MessageCircle}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Aktuelle Anfragen</h2>
        {myActiveRequests.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            text="Du hast aktuell keine aktiven Anfragen."
          />
        ) : (
          myActiveRequests.map((r) => <RequestCard key={r.id} request={r} />)
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Offene Chats</h2>
        {openChats.length === 0 ? (
          <EmptyState icon={MessageCircle} text="Aktuell keine offenen Chats." />
        ) : (
          openChats.map((r) => (
            <ChatListCard
              key={r.id}
              request={r}
              otherPersonName={
                r.requesterId === userId ? r.lender!.name : r.requester.name
              }
            />
          ))
        )}
      </section>
    </div>
  );
}
