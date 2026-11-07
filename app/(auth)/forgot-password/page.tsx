"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "../signup/signup.module.css";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    // Presentation only: no API request, email, or database update.
    setSubmitted(true);
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.panel}
        aria-labelledby="recovery-heading"
      >
        <header className={styles.header}>
          <h1
            id="recovery-heading"
            className={styles.heading}
          >
            Forgot your password?
          </h1>

          <p className={styles.description}>
            {submitted
              ? "Here is how password recovery would work."
              : "Preview the password recovery experience."}
          </p>
        </header>

        {submitted ? (
          <div role="status" aria-live="polite">
            <p className={styles.description}>
              Demo complete. In a live version, an eligible
              account would receive an email containing
              instructions to reset its password.
            </p>

            <p className={styles.description}>
              No email was sent, no account was checked,
              and your password has not changed.
            </p>

            <button
              type="button"
              className={styles.submitButton}
              onClick={() => setSubmitted(false)}
            >
              Try the demo again
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={styles.form}
          >
            <p
              id="recovery-demo-note"
              className={styles.help}
            >
              Presentation demo only. Use a sample email
              address. This form does not send email or
              reset passwords.
            </p>

            <div className={styles.field}>
              <label
                htmlFor="recovery-email"
                className={styles.label}
              >
                Email
              </label>

              <input
                id="recovery-email"
                name="email"
                type="email"
                placeholder="student@example.com"
                required
                maxLength={254}
                aria-describedby="recovery-demo-note"
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
            >
              Preview password reset
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}

        <p className={styles.accountNote}>
          <Link href="/signin" className={styles.link}>
            Back to sign in
          </Link>
        </p>

        <p className={styles.demoNote}>
          College-project demonstration. Password recovery
          is a prototype and is not connected to an email
          service or account-update system.
        </p>
      </section>
    </main>
  );
}