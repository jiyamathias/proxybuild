import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-sm text-[var(--pb-text-muted)]">
          Sign in to your ProxyBuild account
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
