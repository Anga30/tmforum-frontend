"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { IndividualDetailsFields } from "@/components/forms/individual-details-fields";
import { AuthShell } from "@/components/layout/auth-shell";
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

    if (password !== String(data.get("confirmPassword"))) {
      setError("Password and confirm password must match.");
      return;
    }

    setLoading(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const result = await registerAdmin({
        givenName: String(data.get("givenName")),
        middleName: String(data.get("middleName")) || undefined,
        familyName: String(data.get("familyName")),
        birthDate: String(data.get("birthDate")) || undefined,
        gender: String(data.get("gender")) || undefined,
        nationality: String(data.get("nationality")) || undefined,
        email: String(data.get("email")),
        password,
      });

      setMessage(`Registration created for ${result.account.email}. Check Mailpit to verify the email.`);
      form.reset();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Unable to register the administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell active="register" eyebrow="Create account" title="Register as administrator">
      <form className="auth-form auth-form--registration" onSubmit={submit}>
        <IndividualDetailsFields />
        <fieldset className="registration-section">
          <div className="registration-section-heading">
            <legend>Account security</legend>
            <p><b aria-hidden="true">*</b> Required fields</p>
          </div>
          <div className="registration-field-grid">
            <label>
              <span>Email address <b aria-hidden="true">*</b></span>
              <input name="email" required type="email" maxLength={320} autoComplete="email" placeholder="admin@company.com" />
            </label>
            <span className="registration-field-spacer" aria-hidden="true" />
            <label>
              <span>Password <b aria-hidden="true">*</b></span>
              <input name="password" required type="password" minLength={12} maxLength={128} autoComplete="new-password" placeholder="At least 12 characters" />
              <small>Use at least 12 characters.</small>
            </label>
            <label>
              <span>Confirm password <b aria-hidden="true">*</b></span>
              <input name="confirmPassword" required type="password" minLength={12} maxLength={128} autoComplete="new-password" placeholder="Repeat password" />
              <small aria-hidden="true">&nbsp;</small>
            </label>
          </div>
        </fieldset>
        <button disabled={loading} type="submit">{loading ? "Creating profile..." : "Create administrator profile →"}</button>
      </form>
      {message && <p className="success" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <Link className="auth-back-link" href="/">← Back to home</Link>
    </AuthShell>
  );
}
