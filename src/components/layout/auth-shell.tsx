import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  active: "login" | "register";
  children: ReactNode;
  eyebrow: string;
  title: string;
};

export function AuthShell({ active, children, eyebrow, title }: AuthShellProps) {
  return (
    <main className="auth-shell">
      <section className="auth-aside">
        <Link className="brand" href="/">
          <span className="brand-mark">◇</span>
          <span>PARTYCORE</span>
        </Link>
        <div className="auth-aside-copy">
          <p className="eyebrow">TM Forum aligned</p>
          <h1>Party and access management for modern teams.</h1>
          <p>Manage individuals, organizations, roles, and permission sets from one secure administration console.</p>
        </div>
        <ul className="auth-feature-list">
          <li><strong>Party management</strong><span>Individuals and organizations</span></li>
          <li><strong>Permission sets</strong><span>Composable access rules</span></li>
          <li><strong>Role assignment</strong><span>Clear access responsibilities</span></li>
        </ul>
      </section>

      <section className="auth-content">
        <div className="auth-panel">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <div className="auth-tabs" aria-label="Authentication options">
            <Link className={active === "login" ? "is-active" : ""} href="/admin/login">Sign in</Link>
            <Link className={active === "register" ? "is-active" : ""} href="/admin/register">Register</Link>
          </div>
          {children}
          <p className="auth-restriction">Access is restricted to authorized administrators only.</p>
        </div>
      </section>
    </main>
  );
}
