import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getExpenseProfile } from "@/server/questionnaire/getExpenseProfile";
import ExpenseForm from "@/components/questionnaire/ExpenseForm";
import styles from "./questionnaire.module.css";

export default async function QuestionnairePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const profile = await getExpenseProfile(session.user.id);

  return (
    <main className={styles.page}>
      <section
        className={styles.panel}
        aria-labelledby="questionnaire-heading"
      >
        <header className={styles.header}>
          <h1
            id="questionnaire-heading"
            className={styles.heading}
          >
            Tell us about your expenses
          </h1>

          <p className={styles.description}>
            A quick snapshot of your typical monthly costs.
            This helps you set a realistic savings goal—it
            doesn&apos;t affect your reward.
          </p>
        </header>

        <ExpenseForm
          initialValues={profile ?? undefined}
          redirectTo="/onboarding/goal"
          submitLabel="Continue"
        />
      </section>
    </main>
  );
}