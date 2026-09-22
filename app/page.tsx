import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Vault
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Save with a goal.
          </h1>

          <p className="mt-3 text-gray-600">
            Set a savings target, track your progress, and stay on course.
          </p>
        </div>

        <Link
          href={isSignedIn ? "/dashboard" : "/signin"}
          className="inline-flex w-full items-center justify-center rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          {isSignedIn ? "Go to dashboard" : "Get started"}
        </Link>

        {!isSignedIn && (
          <p className="mt-6 text-sm leading-6 text-gray-500">
            Don&apos;t have an account? Your Vault account will be created
            when you sign in with Google.
          </p>
        )}
      </div>
    </main>
  );
}
