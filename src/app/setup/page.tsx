import { AuthShell } from "@/components/layouts/auth-shell";
import { SetupForm } from "@/app/setup/setup-form";

export default function SetupPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-display text-3xl italic text-fg">Mein</p>
          <h1 className="text-xl text-fg">This machine is yours.</h1>
          <p className="text-sm text-muted">
            Create the owner account. One person. No team.
          </p>
        </div>
        <SetupForm />
      </div>
    </AuthShell>
  );
}
