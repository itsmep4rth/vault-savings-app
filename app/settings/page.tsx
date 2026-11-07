import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  verifyPassword,
} from "@/lib/password";
import { getExpenseProfile } from "@/server/questionnaire/getExpenseProfile";
import ExpenseForm from "@/components/questionnaire/ExpenseForm";
import styles from "../vault-pages.module.css";

const DELETE_ERRORS: Record<string, string> = {
  confirmation: "Type DELETE exactly to confirm account deletion.",
  password: "The password was incorrect. Your account was not deleted.",
  passwordless:
    "This account does not have a password. Account deletion requires a secure account recovery or reauthentication flow first.",
  billing:
    "Self-service deletion is unavailable for accounts with billing records or a premium plan. Billing must be resolved first.",
  changed:
    "Your account could not be deleted because its details changed. Refresh this page and try again.",
  unavailable:
    "Account deletion is temporarily unavailable. Your account was not deleted. Please try again.",
};

async function deleteAccount(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;
  const confirmation = formData.get("confirmation");
  const password = formData.get("password");

  if (confirmation !== "DELETE") {
    redirect("/settings?deleteError=confirmation#delete-account");
  }

  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    redirect("/settings?deleteError=password#delete-account");
  }

  let errorCode: string | null = null;
  let deleted = false;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordHash: true,
        plan: true,
        stripeCustomerId: true,
        subscription: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      errorCode = "changed";
    } else if (!user.passwordHash) {
      errorCode = "passwordless";
    } else if (
      user.plan !== "free" ||
      user.stripeCustomerId !== null ||
      user.subscription !== null
    ) {
      errorCode = "billing";
    } else {
      const passwordMatches = await verifyPassword(
        password,
        user.passwordHash
      );

      if (!passwordMatches) {
        errorCode = "password";
      } else {
        const result = await prisma.user.deleteMany({
          where: {
            id: userId,
            passwordHash: user.passwordHash,
            plan: "free",
            stripeCustomerId: null,
            subscription: {
              is: null,
            },
          },
        });

        deleted = result.count === 1;

        if (!deleted) {
          errorCode = "changed";
        }
      }
    }
  } catch {
    errorCode = "unavailable";
    console.error("Account deletion failed.");
  }

  if (!deleted) {
    redirect(
      `/settings?deleteError=${errorCode ?? "unavailable"}#delete-account`
    );
  }

  await signOut({ redirectTo: "/" });
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    deleteError?: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const [profile, params] = await Promise.all([
    getExpenseProfile(session.user.id),
    searchParams,
  ]);

  const deleteError = params.deleteError
    ? DELETE_ERRORS[params.deleteError] ??
      "Account deletion could not be completed."
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.mediumContainer}>
        <div className={styles.stack}>
          <header className={styles.panel}>
            <Link
              href="/dashboard"
              className={styles.backLink}
            >
              Back to dashboard
            </Link>

            <h1 className={styles.heading}>Settings</h1>

            <p className={styles.description}>
              View your profile, update your monthly expenses,
              and manage your account.
            </p>
          </header>

          <section
            className={styles.panel}
            aria-labelledby="profile-heading"
          >
            <h2
              id="profile-heading"
              className={styles.sectionHeading}
            >
              Profile
            </h2>

            <dl className={styles.profile}>
              <div className={styles.profileRow}>
                <dt className={styles.profileLabel}>Name</dt>
                <dd className={styles.profileValue}>
                  {session.user.name ?? "Not provided"}
                </dd>
              </div>

              <div className={styles.profileRow}>
                <dt className={styles.profileLabel}>Email</dt>
                <dd className={styles.profileValue}>
                  {session.user.email}
                </dd>
              </div>

              <div className={styles.profileRow}>
                <dt className={styles.profileLabel}>Plan</dt>
                <dd
                  className={`${styles.profileValue} ${styles.plan}`}
                >
                  {session.user.plan}
                </dd>
              </div>
            </dl>
          </section>

          <section
            className={styles.panel}
            aria-labelledby="expenses-heading"
          >
            <h2
              id="expenses-heading"
              className={styles.sectionHeading}
            >
              Monthly expenses
            </h2>

            <p className={styles.description}>
              Used to help you plan a realistic savings goal.
            </p>

            <div className={styles.formArea}>
              <ExpenseForm
                initialValues={profile ?? undefined}
                redirectTo="/settings"
                submitLabel="Save changes"
              />
            </div>
          </section>

          <section
            id="delete-account"
            className={styles.panel}
            aria-labelledby="delete-account-heading"
          >
            <h2
              id="delete-account-heading"
              className={styles.sectionHeading}
            >
              Delete account
            </h2>

            <p className={styles.description}>
              Permanently delete your Vault account, savings
              goals, savings entries, and monthly expense
              profile. This action cannot be undone.
            </p>

            <p className={styles.description}>
              Deletion requires your current password.
              Accounts without a password or with billing
              records are not eligible for self-service
              deletion in this version.
            </p>

            {deleteError && (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-red-300/40 bg-red-950/60 p-4 text-sm text-red-100"
              >
                {deleteError}
              </p>
            )}

            <form
              action={deleteAccount}
              className={`${styles.formArea} flex flex-col gap-5`}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="delete-password"
                  className="text-sm font-semibold text-white"
                >
                  Current password
                </label>

                <input
                  id="delete-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  maxLength={MAX_PASSWORD_LENGTH}
                  className="min-h-12 w-full rounded-lg border border-white/25 bg-[#0b2b1f] px-4 py-3 text-white outline-none focus-visible:border-[#8ff2bc] focus-visible:ring-2 focus-visible:ring-[#8ff2bc]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="delete-confirmation"
                  className="text-sm font-semibold text-white"
                >
                  Type DELETE to confirm
                </label>

                <input
                  id="delete-confirmation"
                  name="confirmation"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  required
                  pattern="DELETE"
                  maxLength={6}
                  aria-describedby="delete-confirmation-help"
                  className="min-h-12 w-full rounded-lg border border-white/25 bg-[#0b2b1f] px-4 py-3 text-white outline-none focus-visible:border-[#8ff2bc] focus-visible:ring-2 focus-visible:ring-[#8ff2bc]"
                />

                <p
                  id="delete-confirmation-help"
                  className="text-sm text-[#c4d5cc]"
                >
                  Enter DELETE in uppercase. Submitting this
                  form permanently deletes your account.
                </p>
              </div>

              <button
                type="submit"
                className="min-h-12 rounded-lg border border-red-300/40 bg-red-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-300"
              >
                Permanently delete my account
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}