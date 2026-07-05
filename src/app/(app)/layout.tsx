import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { PushOptIn } from "@/components/PushOptIn";
import { NavLinks } from "@/components/NavLinks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const initials = (session.user.name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-1 flex-col">
      <PushOptIn />
      <nav className="flex items-center justify-between gap-2 border-b bg-card px-3 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/home"
            className="hidden shrink-0 text-lg font-semibold text-primary sm:mr-2 sm:inline"
          >
            Sharing is Caring
          </Link>
          <NavLinks />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {session.user.name} · {session.user.city}
            </span>
          </div>
          <SignOutButton />
        </div>
      </nav>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
