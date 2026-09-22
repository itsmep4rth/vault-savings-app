import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getExpenseProfile } from "@/server/questionnaire/getExpenseProfile";
import ExpenseForm from "@/components/questionnaire/ExpenseForm";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const profile = await getExpenseProfile(session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Profile</h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd>{session.user.name ?? "—"}</dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd>{session.user.email}</dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-gray-500">Plan</dt>
            <dd className="capitalize">{session.user.plan}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Monthly expenses</h2>

        <p className="mt-1 text-sm text-gray-500">
          Used to help you plan a realistic savings goal.
        </p>

        <div className="mt-6">
          <ExpenseForm
            initialValues={profile ?? undefined}
            redirectTo="/settings"
            submitLabel="Save changes"
          />
        </div>
      </section>
    </main>
  );
}
