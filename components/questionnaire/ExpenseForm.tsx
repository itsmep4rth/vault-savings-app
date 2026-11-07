"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./ExpenseForm.module.css";

type ExpenseFields = {
  rent: number;
  groceries: number;
  food: number;
  transport: number;
  utilities: number;
  other: number;
};

const FIELD_LABELS: {
  key: keyof ExpenseFields;
  label: string;
}[] = [
  { key: "rent", label: "Rent / mortgage" },
  { key: "groceries", label: "Groceries" },
  { key: "food", label: "Dining out" },
  { key: "transport", label: "Transport" },
  { key: "utilities", label: "Utilities" },
  { key: "other", label: "Other" },
];

type ExpenseFormProps = {
  initialValues?: Partial<ExpenseFields>;
  redirectTo?: string;
  submitLabel?: string;
};

export default function ExpenseForm({
  initialValues,
  redirectTo = "/onboarding/goal",
  submitLabel = "Continue",
}: ExpenseFormProps) {
  const router = useRouter();
  const formId = useId();

  const [values, setValues] = useState<
    Record<keyof ExpenseFields, string>
  >({
    rent: String(initialValues?.rent ?? ""),
    groceries: String(initialValues?.groceries ?? ""),
    food: String(initialValues?.food ?? ""),
    transport: String(initialValues?.transport ?? ""),
    utilities: String(initialValues?.utilities ?? ""),
    other: String(initialValues?.other ?? ""),
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(
    key: keyof ExpenseFields,
    value: string,
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rent: Number(values.rent || 0),
          groceries: Number(values.groceries || 0),
          food: Number(values.food || 0),
          transport: Number(values.transport || 0),
          utilities: Number(values.utilities || 0),
          other: Number(values.other || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save expense profile.",
        );
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      aria-busy={loading}
    >
      <p id={`${formId}-help`} className={styles.help}>
        Enter your typical monthly amount for each category.
        Enter 0 if a category does not apply.
      </p>

      {FIELD_LABELS.map(({ key, label }) => {
        const inputId = `${formId}-${key}`;

        return (
          <div key={key} className={styles.field}>
            <label
              htmlFor={inputId}
              className={styles.label}
            >
              {label}
            </label>

            <div className={styles.inputWrapper}>
              <span
                className={styles.currency}
                aria-hidden="true"
              >
                $
              </span>

              <input
                id={inputId}
                name={key}
                type="number"
                min="0"
                step="1"
                value={values[key]}
                onChange={(event) =>
                  updateField(key, event.target.value)
                }
                placeholder="0"
                required
                aria-describedby={`${formId}-help`}
                className={styles.input}
              />
            </div>
          </div>
        );
      })}

      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? "Saving..." : submitLabel}

        {!loading && (
          <span aria-hidden="true">→</span>
        )}
      </button>
    </form>
  );
}