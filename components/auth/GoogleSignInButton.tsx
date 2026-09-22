"use client";

import { signIn } from "next-auth/react";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
};

export default function GoogleSignInButton({
  callbackUrl,
}: GoogleSignInButtonProps) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard" })}
      className="inline-flex w-full items-center justify-center rounded-xl border bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
    >
      Continue with Google
    </button>
  );
}
