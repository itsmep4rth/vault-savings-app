import CreateGoalForm from "@/components/goal/CreateGoalForm";

export default function GoalOnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-gray-500">Vault</p>

          <h1 className="text-3xl font-bold tracking-tight">
            Create your savings goal
          </h1>

          <p className="mt-2 text-gray-600">
            Choose an amount and a deadline. Vault will help you stay on track.
          </p>
        </div>

        <CreateGoalForm />
      </div>
    </main>
  );
}