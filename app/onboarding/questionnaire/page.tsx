import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getExpenseProfile } from "@/server/questionnaire/getExpenseProfile";
import ExpenseForm from "@/components/questionnaire/ExpenseForm";

export default async function QuestionnairePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const profile = await getExpenseProfile(session.user.id);

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-3xl font-bold">Tell us about your expenses</h1>

      <p className="mt-2 text-gray-600">
        A quick snapshot of your typical monthly costs. This helps you set
        a realistic savings goal — it doesn&apos;t affect your reward.
      </p>

      <div className="mt-8 rounded-xl border bg-white p-6">
        <ExpenseForm
          initialValues={profile ?? undefined}
          redirectTo="/onboarding/goal"
          submitLabel="Continue"
        />
      </div>
    </main>
  );
}
