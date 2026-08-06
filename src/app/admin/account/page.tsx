"use client";

import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { logoutAdmin } from "@/lib/admin-auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/session-storage";

import "./account.css";

const displayValue = (value: string | null): string => value || "Not provided";

export default function AdminAccountPage() {
  const router = useRouter();
  const { session, isLoading } = useAdminSessionGuard();

  const signOut = async () => {
    const accessToken = getAccessToken();
    if (accessToken) await logoutAdmin(accessToken).catch(() => undefined);
    clearAccessToken();
    router.replace("/");
  };

  if (isLoading || !session) return <main className="page-shell"><p>Loading account...</p></main>;

  const { account, individual } = session;
  const fullName = [individual.givenName, individual.middleName, individual.familyName].filter(Boolean).join(" ");
  const initials = `${individual.givenName[0] ?? "A"}${individual.familyName[0] ?? "D"}`.toUpperCase();

  return (
    <AppShell eyebrow="Administrator account" subtitle="Your individual party profile and administrator account details." title="Account">
      <div className="admin-account">
        <section className="admin-account__hero">
          <span className="admin-account__avatar">{initials}</span>
          <div>
            <h2>{fullName}</h2>
            <p>{account.email}</p>
          </div>
        </section>

        <div className="admin-account__grid">
          <section className="admin-account__section">
            <h2>Individual details</h2>
            <dl className="admin-account__details">
              <div><dt>First name</dt><dd>{individual.givenName}</dd></div>
              <div><dt>Middle name</dt><dd>{displayValue(individual.middleName)}</dd></div>
              <div><dt>Surname</dt><dd>{individual.familyName}</dd></div>
              <div><dt>Date of birth</dt><dd>{displayValue(individual.birthDate)}</dd></div>
              <div><dt>Gender</dt><dd>{displayValue(individual.gender)}</dd></div>
              <div><dt>Nationality</dt><dd>{displayValue(individual.nationality)}</dd></div>
            </dl>
          </section>

          <section className="admin-account__section">
            <h2>Account access</h2>
            <dl className="admin-account__details">
              <div className="admin-account__wide"><dt>Email</dt><dd>{account.email}</dd></div>
              <div><dt>Role</dt><dd>{account.role}</dd></div>
              <div><dt>Status</dt><dd className="admin-account__status">{account.status}</dd></div>
              <div className="admin-account__wide"><dt>Executive approver</dt><dd>{account.isExecutiveApprover ? "Yes" : "No"}</dd></div>
            </dl>
          </section>

          <section className="admin-account__section">
            <h2>Contact media</h2>
            <dl className="admin-account__details">
              <div className="admin-account__wide"><dt>Email address</dt><dd>{account.email}</dd></div>
              <div><dt>Phone</dt><dd>{displayValue(individual.phone)}</dd></div>
              <div className="admin-account__wide"><dt>Physical address</dt><dd>{displayValue(individual.address)}</dd></div>
            </dl>
          </section>
        </div>

        <button className="admin-account__signout" onClick={() => void signOut()} type="button">Sign out</button>
      </div>
    </AppShell>
  );
}
