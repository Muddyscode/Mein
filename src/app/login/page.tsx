import { AuthShell } from "@/components/layouts/auth-shell";
import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-display text-3xl italic text-fg">Mein</p>
          <h1 className="text-xl text-fg">Welcome back.</h1>
          <p className="text-sm text-muted">Sign in to your personal API.</p>
        </div>
        <LoginForm />
      </div>
    </AuthShell>
  );
}
