"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGoalForm() {
  const router = useRouter();

  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetAmount: Number(targetAmount),
          deadline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create goal.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Savings target
        </label>

        <div className="flex items-center rounded-lg border px-3">
          <span className="text-gray-500">$</span>
          <input
            type="number"
            min="1"
            step="1"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="1000"
            required
            className="w-full bg-transparent px-2 py-3 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Goal deadline
        </label>

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          className="w-full rounded-lg border px-3 py-3 outline-none"
        />

        <p className="mt-2 text-sm text-gray-500">
          Your deadline must be between 1 and 4 months from today.
        </p>
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
        {loading ? "Creating..." : "Create savings goal"}
      </button>
    </form>
  );
}