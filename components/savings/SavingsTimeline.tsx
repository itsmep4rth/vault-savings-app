"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SavingsEntry = {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
};

type SavingsTimelineProps = {
  entries: SavingsEntry[];
};

export default function SavingsTimeline({
  entries,
}: SavingsTimelineProps) {
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function startEditing(entry: SavingsEntry) {
    setEditingId(entry.id);
    setEditAmount(String(entry.amount));
    setEditNote(entry.note ?? "");
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditAmount("");
    setEditNote("");
    setError("");
  }

  async function handleUpdate(entryId: string) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/savings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId,
          amount: Number(editAmount),
          note: editNote.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update savings.");
      }

      cancelEditing();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(entryId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this savings entry?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/savings?entryId=${encodeURIComponent(entryId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete savings.");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
        No savings entries yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {entries.map((entry) => {
        const isEditing = editingId === entry.id;

        return (
          <div
            key={entry.id}
            className="rounded-xl border bg-white p-5"
          >
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Amount
                  </label>

                  <div className="flex items-center rounded-lg border px-3">
                    <span className="text-gray-500">$</span>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={editAmount}
                      onChange={(event) =>
                        setEditAmount(event.target.value)
                      }
                      className="w-full bg-transparent px-2 py-3 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Note
                  </label>

                  <input
                    type="text"
                    value={editNote}
                    onChange={(event) =>
                      setEditNote(event.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-3 outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleUpdate(entry.id)}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save changes"}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={cancelEditing}
                    className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    ${entry.amount.toLocaleString()}
                  </p>

                  <p className="text-sm text-gray-500">
                    {entry.note || "Savings contribution"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(entry)}
                    className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDelete(entry.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}