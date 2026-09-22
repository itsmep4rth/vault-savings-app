import { prisma } from "@/lib/prisma";

export type ExpenseFields = {
  rent: number;
  groceries: number;
  food: number;
  transport: number;
  utilities: number;
  other: number;
};

type SaveExpenseProfileInput = ExpenseFields & { userId: string };

const EXPENSE_FIELDS: (keyof ExpenseFields)[] = [
  "rent",
  "groceries",
  "food",
  "transport",
  "utilities",
  "other",
];

export async function saveExpenseProfile({
  userId,
  ...fields
}: SaveExpenseProfileInput) {
  for (const field of EXPENSE_FIELDS) {
    const value = fields[field];

    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${field} must be a non-negative number.`);
    }
  }

  return prisma.expenseProfile.upsert({
    where: { userId },
    update: { ...fields },
    create: { userId, ...fields },
  });
}
