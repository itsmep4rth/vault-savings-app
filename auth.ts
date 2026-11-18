import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Auth.js v5 would otherwise look for AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },

  pages: {
    signIn: "/signin",
  },

  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.plan = user.plan;
      return session;
    },
  },
});