"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { loginAdmin } from "@/lib/admin-auth-api";
import { ApiError } from "@/lib/api-client";
import { saveAccessToken } from "@/lib/session-storage";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("reason") === "session" ? "Please sign in to view the administrator account." : "");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setError(""); const data = new FormData(event.currentTarget); try { const result = await loginAdmin(String(data.get("email")), String(data.get("password"))); saveAccessToken(result.accessToken); router.push("/"); } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : "Unable to sign in."); } finally { setLoading(false); } };
  return <main className="page-shell"><Link className="back-link" href="/">Back to home</Link><section className="page-intro"><p className="eyebrow">Secure access</p><h1>Welcome back</h1><p>Sign in to continue managing your administrator account and party details.</p></section><form className="form-card compact-card" onSubmit={submit}><fieldset className="field-group"><legend>Administrator sign in</legend><div className="field-grid"><label>Email address<input name="email" required type="email" autoComplete="email" /></label><label>Password<input name="password" required type="password" autoComplete="current-password" /></label></div></fieldset><button disabled={loading} type="submit">{loading ? "Signing in..." : "Sign in"}</button></form>{error && <p className="error" role="alert">{error}</p>}</main>;
}
