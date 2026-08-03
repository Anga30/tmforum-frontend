"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { IndividualDetailsFields } from "@/components/forms/individual-details-fields";
import { registerAdmin } from "@/lib/admin-auth-api";
import { ApiError } from "@/lib/api-client";

export default function RegisterAdminPage() {
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirmPassword"))) { setError("Password and confirm password must match."); return; }
    setLoading(true); setError(undefined); setMessage(undefined);
    try {
      const result = await registerAdmin({ givenName: String(data.get("givenName")), middleName: String(data.get("middleName")) || undefined, familyName: String(data.get("familyName")), birthDate: String(data.get("birthDate")) || undefined, gender: String(data.get("gender")) || undefined, nationality: String(data.get("nationality")) || undefined, email: String(data.get("email")), password });
      setMessage(`Registration created for ${result.account.email}. Check Mailpit to verify the email.`); form.reset();
    } catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : "Unable to register the administrator."); }
    finally { setLoading(false); }
  };

  return <main className="page-shell"><Link className="back-link" href="/">Back to home</Link><section className="page-intro"><p className="eyebrow">Admin access</p><h1>Create your administrator profile</h1><p>Your account is securely linked to an Individual Party. Complete the core details below to get started.</p></section><form className="form-card" onSubmit={submit}><IndividualDetailsFields /><fieldset className="field-group"><legend>Account security</legend><div className="field-grid"><label>Email address <span aria-hidden="true">*</span><input name="email" required type="email" maxLength={320} autoComplete="email" /></label><div className="field-spacer" /><label>Password <span aria-hidden="true">*</span><input name="password" required type="password" minLength={12} maxLength={128} autoComplete="new-password" /><span className="field-help">Use at least 12 characters.</span></label><label>Confirm password <span aria-hidden="true">*</span><input name="confirmPassword" required type="password" minLength={12} maxLength={128} autoComplete="new-password" /></label></div></fieldset><button disabled={loading} type="submit">{loading ? "Creating profile..." : "Create administrator profile"}</button></form>{message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}</main>;
}
