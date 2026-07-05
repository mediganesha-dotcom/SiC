import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-xl font-semibold">Profil</h1>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium text-gray-500">Name</dt>
          <dd>{session?.user.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">E-Mail</dt>
          <dd>{session?.user.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Standort</dt>
          <dd>
            {session?.user.city}, {session?.user.postalCode}
          </dd>
        </div>
      </dl>
    </div>
  );
}
