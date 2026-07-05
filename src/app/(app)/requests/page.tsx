import Link from "next/link";
import { PackageSearch, ListChecks } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestCard } from "@/components/RequestCard";
import { EmptyState } from "@/components/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function RequestsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const { city, postalCode } = session!.user;

  const [nearbyRequests, myRequests] = await Promise.all([
    prisma.lendingRequest.findMany({
      where: {
        status: "OPEN",
        requesterId: { not: userId },
        OR: [{ city }, { postalCode }],
        NOT: { responses: { some: { userId } } },
      },
      include: { requester: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lendingRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Anfragen</h1>
        <Link href="/requests/new" className={buttonVariants()}>
          Neue Anfrage
        </Link>
      </div>

      <Tabs defaultValue="nearby">
        <TabsList>
          <TabsTrigger value="nearby">In deiner Nähe</TabsTrigger>
          <TabsTrigger value="mine">Deine Anfragen</TabsTrigger>
        </TabsList>
        <TabsContent value="nearby" className="flex flex-col gap-3 pt-4">
          {nearbyRequests.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              text="Aktuell keine offenen Anfragen in deiner Nähe."
            />
          ) : (
            nearbyRequests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                requesterName={r.requester.name}
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="mine" className="flex flex-col gap-3 pt-4">
          {myRequests.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              text="Du hast noch keine Anfrage erstellt."
            />
          ) : (
            myRequests.map((r) => <RequestCard key={r.id} request={r} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
