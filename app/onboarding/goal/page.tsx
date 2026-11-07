import CreateGoalForm from "@/components/goal/CreateGoalForm";
import styles from "@/app/vault-pages.module.css";

export default function GoalOnboardingPage() {
  return (
    <main className={`${styles.page} flex items-center justify-center`}>
      <div className={styles.narrowContainer}>
        <section
          className={styles.panel}
          aria-labelledby="create-goal-heading"
        >
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Vault</p>

              <h1
                id="create-goal-heading"
                className={styles.heading}
              >
                Create your savings goal
              </h1>

              <p className={styles.description}>
                Choose an amount and a deadline. Vault will help
                you stay on track.
              </p>
            </div>
          </header>

          <div className={styles.formArea}>
            <CreateGoalForm />
          </div>
        </section>
      </div>
    </main>
  );
}