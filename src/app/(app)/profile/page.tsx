import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();
  const name = session?.user.name ?? "?";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">E-Mail</dt>
              <dd>{session?.user.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Standort</dt>
              <dd>
                {session?.user.city}, {session?.user.postalCode}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
