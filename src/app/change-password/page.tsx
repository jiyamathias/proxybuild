import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "./form";
import { ProxyBuildLogo } from "@/components/ui/logo";

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[var(--pb-bg)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <ProxyBuildLogo size={40} wordmark />
        </div>

        <div className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">Set your password</h1>
            <p className="text-sm text-[var(--pb-text-muted)]">
              Welcome to ProxyBuild. Please create a personal password to secure your account before continuing.
            </p>
          </div>

          <ChangePasswordForm role={session.role} />
        </div>
      </div>
    </div>
  );
}
