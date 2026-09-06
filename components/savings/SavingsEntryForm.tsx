"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SavingsEntryFormProps = {
  goalId: string;
};

export default function SavingsEntryForm({
  goalId,
}: SavingsEntryFormProps) {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalId,
          amount: Number(amount),
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add savings.");
      }

      setAmount("");
      setNote("");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Amount saved
        </label>

        <div className="flex items-center rounded-lg border px-3">
          <span className="text-gray-500">$</span>

          <input
            type="number"
            min="1"
            step="1"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100"
            className="w-full bg-transparent px-2 py-3 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Note <span className="font-normal text-gray-400">(optional)</span>
        </label>

        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Paycheck, side job, etc."
          className="w-full rounded-lg border px-3 py-3 outline-none"
        />
      </div>

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
        {loading ? "Saving..." : "Add savings"}
      </button>
    </form>
  );
}