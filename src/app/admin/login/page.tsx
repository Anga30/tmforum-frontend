"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthShell } from "@/components/layout/auth-shell";
import { loginAdmin } from "@/lib/admin-auth-api";
import { ApiError } from "@/lib/api-client";
import { saveAccessToken } from "@/lib/session-storage";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("reason") === "session" ? "Please sign in to view the administrator account." : "");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setError(""); const data = new FormData(event.currentTarget); try { const result = await loginAdmin(String(data.get("email")), String(data.get("password"))); saveAccessToken(result.accessToken); router.push("/"); } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : "Unable to sign in."); } finally { setLoading(false); } };
  return (
    <AuthShell active="login" eyebrow="Admin access" title="Sign in to console">
      <form className="auth-form" onSubmit={submit}>
        <label>
          Email address
          <input name="email" required type="email" autoComplete="email" placeholder="admin@company.com" />
        </label>
        <label>
          Password
          <input name="password" required type="password" autoComplete="current-password" placeholder="Enter your password" />
        </label>
        <button disabled={loading} type="submit">{loading ? "Signing in..." : "Sign in →"}</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <Link className="auth-back-link" href="/">← Back to home</Link>
    </AuthShell>
  );
}
