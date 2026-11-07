import type { Plan } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    plan: Plan;
  }

  interface Session {
    user: {
      id: string;
      plan: Plan;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: Plan;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    plan: Plan;
  }
}