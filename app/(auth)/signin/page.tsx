import { redirect } from "next/navigation";
import { auth } from "@/auth";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user?.id) {
    redirect(callbackUrl || "/dashboard");
  }

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
            Sign in to set a goal, track your savings, and earn interest
            when you follow through.
          </p>
        </div>

        <GoogleSignInButton callbackUrl={callbackUrl} />

        <p className="mt-6 text-sm leading-6 text-gray-500">
          Don&apos;t have an account? Your Vault account will be created
          when you sign in with Google.
        </p>
      </div>
    </main>
  );
}
