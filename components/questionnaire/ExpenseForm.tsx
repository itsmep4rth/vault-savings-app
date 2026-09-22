"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ExpenseFields = {
  rent: number;
  groceries: number;
  food: number;
  transport: number;
  utilities: number;
  other: number;
};

const FIELD_LABELS: { key: keyof ExpenseFields; label: string }[] = [
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

  const [values, setValues] = useState<Record<keyof ExpenseFields, string>>({
    rent: String(initialValues?.rent ?? ""),
    groceries: String(initialValues?.groceries ?? ""),
    food: String(initialValues?.food ?? ""),
    transport: String(initialValues?.transport ?? ""),
    utilities: String(initialValues?.utilities ?? ""),
    other: String(initialValues?.other ?? ""),
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(key: keyof ExpenseFields, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        throw new Error(data.error || "Failed to save expense profile.");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELD_LABELS.map(({ key, label }) => (
        <div key={key}>
          <label className="mb-2 block text-sm font-medium">{label}</label>

          <div className="flex items-center rounded-lg border px-3">
            <span className="text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={values[key]}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder="0"
              required
              className="w-full bg-transparent px-2 py-3 outline-none"
            />
          </div>
        </div>
      ))}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
