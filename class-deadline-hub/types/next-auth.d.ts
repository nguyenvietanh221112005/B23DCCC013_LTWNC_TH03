import type { DefaultSession } from "next-auth";
import type { AuthRole } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AuthRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: AuthRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: AuthRole;
  }
}
