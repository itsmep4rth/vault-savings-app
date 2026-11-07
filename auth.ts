import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { validatePassword, verifyPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Email and password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        if (
          !email ||
          email.length > 254 ||
          validatePassword(password) !== null
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            plan: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordMatches = await verifyPassword(
          password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          plan: user.plan,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
  },

  pages: {
    signIn: "/signin",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }

      if (!token.sub) {
        return null;
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          plan: true,
        },
      });

      if (!existingUser) {
        return null;
      }

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.picture = existingUser.image;
      token.plan = existingUser.plan;

      return token;
    },

    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.plan = token.plan ?? "free";
      }

      return session;
    },
  },
});