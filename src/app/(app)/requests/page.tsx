import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestCard } from "@/components/RequestCard";

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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Anfragen in deiner Nähe</h1>
        <Link
          href="/requests/new"
          className="rounded bg-black px-3 py-2 text-sm text-white"
        >
          Neue Anfrage
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        {nearbyRequests.length === 0 && (
          <p className="text-sm text-gray-500">
            Aktuell keine offenen Anfragen in deiner Nähe.
          </p>
        )}
        {nearbyRequests.map((r) => (
          <RequestCard key={r.id} request={r} requesterName={r.requester.name} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Deine Anfragen</h2>
        {myRequests.length === 0 && (
          <p className="text-sm text-gray-500">
            Du hast noch keine Anfrage erstellt.
          </p>
        )}
        {myRequests.map((r) => (
          <RequestCard key={r.id} request={r} />
        ))}
      </section>
    </div>
  );
}
