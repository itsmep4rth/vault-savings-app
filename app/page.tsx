import Link from "next/link";
import { auth } from "@/auth";
import GoogleSignInButton from "./components/GoogleSignInButton";

export default async function Login() {
  const session = await auth();

  if (session?.user?.id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Vault
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome to Vault
            </h1>

            <p className="mt-3 text-gray-600">
              You&apos;re signed in. Continue to your savings dashboard.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Go to dashboard
          </Link>
        </div>
      </main>
    );
  }

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

        <div className="mb-6">
          <GoogleSignInButton />
        </div>

        <p className="text-sm leading-6 text-gray-500">
          Don&apos;t have an account? Your Vault account will be created when
          you sign in with Google.
        </p>
      </div>
    </main>
  );
}