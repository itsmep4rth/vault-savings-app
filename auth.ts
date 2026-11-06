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

  logger: {
    error(error) {
      console.error("[Vault Auth Error]", {
        name: error.name,
        type: error.type,
        message: error.message,
      });

      const underlyingError = error.cause?.err;

      if (underlyingError instanceof Error) {
        console.error("[Vault Auth Cause]", {
          name: underlyingError.name,
          message: underlyingError.message,
        });
      }
    },
  },
});