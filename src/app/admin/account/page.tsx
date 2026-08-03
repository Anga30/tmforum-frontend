"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentAdmin, logoutAdmin } from "@/lib/admin-auth-api";
import { clearAccessToken, getAccessToken } from "@/lib/session-storage";
import type { AdminSession } from "@/types/admin-auth.types";

export default function AdminAccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession>();

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.replace("/admin/login?reason=session");
      return;
    }
    void getCurrentAdmin(accessToken).then(setSession).catch(() => {
      clearAccessToken();
      router.replace("/admin/login?reason=session");
    });
  }, [router]);

  const signOut = async () => {
    const accessToken = getAccessToken();
    if (accessToken) await logoutAdmin(accessToken);
    clearAccessToken();
    router.replace("/");
  };

  if (!session) return <main className="page-shell"><p>Loading account...</p></main>;
  return <main className="page-shell"><Link href="/">Back</Link><h1>Administrator account</h1><section className="form-card"><p><strong>Email:</strong> {session.account.email}</p><p><strong>Role:</strong> {session.account.role}</p><p><strong>Status:</strong> {session.account.status}</p><p><strong>Executive approver:</strong> {session.account.isExecutiveApprover ? "Yes" : "No"}</p><button onClick={() => void signOut()} type="button">Sign out</button></section></main>;
}
