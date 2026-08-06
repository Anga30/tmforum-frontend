"use client";

import "./dashboard.css";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentAdmin } from "@/lib/admin-auth-api";
import { getDashboardOverview } from "@/lib/dashboard-api";
import { clearAccessToken, getAccessToken } from "@/lib/session-storage";
import type { AdminAccount } from "@/types/admin-auth.types";
import type { DashboardOverview } from "@/types/dashboard.types";

export default function Home() {
  const [account, setAccount] = useState<AdminAccount>();
  const [overview, setOverview] = useState<DashboardOverview>();
  const [dashboardError, setDashboardError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      void Promise.resolve().then(() => setIsCheckingSession(false));
      return;
    }

    void getCurrentAdmin(accessToken)
      .then((session) => setAccount(session.account))
      .catch(() => clearAccessToken())
      .finally(() => setIsCheckingSession(false));

    if (accessToken) {
      void getDashboardOverview(accessToken)
        .then(setOverview)
        .catch(() => setDashboardError("Unable to load the dashboard overview."));
    }
  }, []);

  if (isCheckingSession) {
    return <main className="dashboard-session-loading"><p>Loading your workspace…</p></main>;
  }

  if (account) {
    return (
      <AppShell eyebrow="System overview" title="Dashboard" subtitle="Party and access management">
        <section className="dashboard-welcome">
          <p className="eyebrow">Welcome back</p>
          <h2>Manage your party and access data from one place.</h2>
          <p>You are signed in with the <strong>{account.role}</strong> role.</p>
        </section>
        {dashboardError && <p className="error">{dashboardError}</p>}
        {!overview && !dashboardError && <p className="dashboard-loading">Loading dashboard data…</p>}
        {overview && <>
          <section className="dashboard-summary-grid" aria-label="Dashboard summary">
            <Link href="/parties"><span>◌</span><strong>{overview.summary.totalParties}</strong><h2>Total parties</h2><p>{overview.summary.activeParties} active</p></Link>
            <Link href="/parties?filter=ORGANIZATION"><span>▥</span><strong>{overview.summary.organizations}</strong><h2>Organizations</h2><p>{overview.summary.activeOrganizations} active</p></Link>
            <Link href="/parties?filter=INDIVIDUAL"><span>♙</span><strong>{overview.summary.individuals}</strong><h2>Individuals</h2><p>{overview.summary.activeIndividuals} active</p></Link>
            <Link href="/access-control/permission-sets"><span>⌘</span><strong>{overview.summary.permissionSets}</strong><h2>Permission sets</h2><p>{overview.summary.permissions} total permissions</p></Link>
          </section>
          <section className="dashboard-data-grid">
            <article className="dashboard-data-card"><header><h2>Recent activity</h2></header>{overview.activity.map((item) => <div className="activity-row" key={item.id}><span>•</span><p><strong>{item.action}</strong> {item.target}<small>by {item.actor} · {new Date(item.occurredAt).toLocaleString()}</small></p></div>)}{!overview.activity.length && <p className="empty-state">No activity recorded yet.</p>}</article>
            <article className="dashboard-data-card"><header><h2>Permission sets</h2><Link href="/access-control/permission-sets">View all</Link></header>{overview.permissionSets.map((set) => <div className="set-row" key={set.id}><strong>{set.name}</strong><span>{set.permissionCount} permissions · {set.partyCount} parties</span></div>)}{!overview.permissionSets.length && <p className="empty-state">No permission sets created yet.</p>}</article>
          </section>
          <section className="dashboard-table-card"><header><h2>Party overview</h2><Link href="/parties">Manage parties</Link></header><div className="dashboard-table"><div className="dashboard-table-head"><span>Party</span><span>Type</span><span>Status</span><span>Roles</span><span>Created</span></div>{overview.parties.map((party) => <Link href={`/parties?selectedPartyId=${party.id}&type=${party.partyType}`} key={party.id}><strong>{party.name}</strong><span>{party.partyType === "ORGANIZATION" ? "Organization" : "Individual"}</span><span className={`status-chip status-chip--${party.status.toLowerCase()}`}>{party.status.replaceAll("_", " ")}</span><span>{party.roleCount}</span><time>{new Date(party.createdAt).toLocaleDateString()}</time></Link>)}</div>{!overview.parties.length && <p className="empty-state">No parties created yet.</p>}</section>
        </>}
      </AppShell>
    );
  }

  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <Link className="brand" href="/">
          <span className="brand-mark">◇</span>
          <span>PARTYCORE</span>
        </Link>
        <div className="landing-copy">
          <p className="eyebrow">TM Forum party management</p>
          <h1>A clear home for parties, roles, and permissions.</h1>
          <p>Manage Individual and Organization parties with verified contact details, then assign roles through structured permission sets.</p>
        </div>
        <div className="landing-capabilities" aria-label="System capabilities">
          <span>Party management</span>
          <span>Permission sets</span>
          <span>Role assignment</span>
        </div>
      </section>
      <section className="landing-actions">
        <div>
          <p className="eyebrow">Administrator access</p>
          <h2>Access the console</h2>
          <p>Register an administrator account or sign in to continue.</p>
        </div>
        <div className="landing-action-buttons">
          <Link className="landing-primary-action" href="/admin/login">Sign in →</Link>
          <Link className="landing-secondary-action" href="/admin/register">Register administrator</Link>
        </div>
        <p className="landing-note">Email verification happens through the secure link sent to the registered email address.</p>
      </section>
    </main>
  );
}
