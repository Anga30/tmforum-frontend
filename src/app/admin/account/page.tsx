"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { logoutAdmin } from "@/lib/admin-auth-api";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { clearAccessToken, getAccessToken } from "@/lib/session-storage";

export default function AdminAccountPage() {
  const router = useRouter();
  const { session, isLoading } = useAdminSessionGuard();

  const signOut = async () => {
    const accessToken = getAccessToken();
    if (accessToken) await logoutAdmin(accessToken);
    clearAccessToken();
    router.replace("/");
  };

  if (isLoading || !session) return <main className="page-shell"><p>Loading account...</p></main>;
  return <main className="page-shell"><Link href="/">Back</Link><h1>Administrator account</h1><section className="form-card"><p><strong>Email:</strong> {session.account.email}</p><p><strong>Role:</strong> {session.account.role}</p><p><strong>Status:</strong> {session.account.status}</p><p><strong>Executive approver:</strong> {session.account.isExecutiveApprover ? "Yes" : "No"}</p><button onClick={() => void signOut()} type="button">Sign out</button></section></main>;
}
