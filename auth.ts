import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [Google],

  session: {
    strategy: "database",
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },
});