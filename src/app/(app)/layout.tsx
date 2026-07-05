import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { PushOptIn } from "@/components/PushOptIn";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <PushOptIn />
      <nav className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/requests">Anfragen</Link>
          <Link href="/profile">Profil</Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {session.user.name} · {session.user.city}
          </span>
          <SignOutButton />
        </div>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
