"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { logoutAdmin } from "@/lib/admin-auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/session-storage";

type AppShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

const navigationItems = [
  { href: "/", label: "Dashboard", symbol: "▦" },
  { href: "/parties", label: "Parties", symbol: "♧" },
  { href: "/access-control", label: "Access control", symbol: "⌘" },
];

export function AppShell({ children, eyebrow, title, subtitle }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    const accessToken = getAccessToken();

    if (accessToken) {
      await logoutAdmin(accessToken).catch(() => undefined);
    }

    clearAccessToken();
    router.push("/admin/login");
  };

  const accessControlActive = pathname.startsWith("/access-control");

  return (
    <div className="console-shell">
      <aside className="console-sidebar">
        <Link className="brand" href="/" aria-label="TM Forum Party Management home">
          <span className="brand-mark">◇</span>
          <span>PARTYCORE</span>
        </Link>

        <nav className="console-nav" aria-label="Primary navigation">
          <p className="nav-label">Navigation</p>
          {navigationItems.map((item) => {
            const isActive = item.href === "/access-control" ? accessControlActive : pathname === item.href || (item.href === "/parties" && pathname.startsWith("/parties"));

            return (
              <Link className={isActive ? "console-nav-link is-active" : "console-nav-link"} href={item.href} key={item.href}>
                <span aria-hidden="true">{item.symbol}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {accessControlActive && (
          <nav className="console-subnav" aria-label="Access control navigation">
            <Link href="/access-control/permissions">Permissions</Link>
            <Link href="/access-control/permission-sets">Permission sets</Link>
            <Link href="/access-control/roles">Roles</Link>
          </nav>
        )}

        <div className="console-account">
          <Link href="/admin/account" className="account-summary">
            <span className="account-avatar">AD</span>
            <span><strong>Administrator</strong><small>Admin account</small></span>
          </Link>
          <button className="sign-out-button" onClick={() => void signOut()} type="button">↪ Sign out</button>
        </div>
      </aside>

      <div className="console-main">
        <header className="console-header">
          <div>
            {eyebrow && <p className="console-eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <Link className="account-link" href="/admin/account">Account</Link>
        </header>
        <main className="console-content">{children}</main>
      </div>
    </div>
  );
}
