"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getCurrentAdmin, logoutAdmin } from "@/lib/admin-auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/session-storage";
import type { AdminAccount } from "@/types/admin-auth.types";

export default function Home() {
  const [account, setAccount] = useState<AdminAccount>();

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      void getCurrentAdmin(accessToken)
        .then((session) => setAccount(session.account))
        .catch(() => clearAccessToken());
    }
  }, []);

  const signOut = async () => {
    const accessToken = getAccessToken();
    if (accessToken) await logoutAdmin(accessToken);
    clearAccessToken();
    setAccount(undefined);
  };

  if (account) {
    return <main className="page-shell"><p className="eyebrow">TM Forum Party Management</p><h1>Welcome, {account.email}</h1><p>Your administrator account is active with the {account.role} role.</p><nav className="link-list" aria-label="Administrator actions"><Link href="/parties">Manage parties</Link><Link href="/admin/account">View account details</Link><button onClick={() => void signOut()} type="button">Sign out</button></nav></main>;
  }

  return <main className="page-shell"><p className="eyebrow">TM Forum Party Management</p><h1>Administrator registration test flow</h1><p>Test registration, email verification, executive approval, and authentication against the local backend.</p><nav className="link-list" aria-label="Administrator test flow"><Link href="/admin/register">Register administrator</Link><Link href="/admin/verify-email">Verify email link manually</Link><Link href="/admin/login">Sign in</Link></nav></main>;
}
