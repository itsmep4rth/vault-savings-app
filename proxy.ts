import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getExpenseProfile } from "@/server/questionnaire/getExpenseProfile";

// Proxy (the successor to Next.js middleware) always runs on the Node.js
// runtime, so the ExpenseProfile lookup below (node-postgres, via Prisma)
// works here without any extra runtime opt-in.

// Every route under these prefixes requires a signed-in user.
const AUTH_REQUIRED_PREFIXES = ["/dashboard", "/onboarding", "/billing", "/settings"];

// Of those, these also require a completed expense questionnaire.
// /onboarding is excluded — it's the flow that produces that profile.
const PROFILE_REQUIRED_PREFIXES = ["/dashboard", "/billing", "/settings"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (!matchesPrefix(pathname, AUTH_REQUIRED_PREFIXES)) {
    return NextResponse.next();
  }

  const userId = req.auth?.user?.id;

  if (!userId) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (matchesPrefix(pathname, PROFILE_REQUIRED_PREFIXES)) {
    const expenseProfile = await getExpenseProfile(userId);

    if (!expenseProfile) {
      return NextResponse.redirect(
        new URL("/onboarding/questionnaire", req.nextUrl.origin)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};
