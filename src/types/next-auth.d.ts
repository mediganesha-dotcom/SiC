import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      city: string;
      postalCode: string;
    } & DefaultSession["user"];
  }

  interface User {
    city: string;
    postalCode: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    city: string;
    postalCode: string;
  }
}
