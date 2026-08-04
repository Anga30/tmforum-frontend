"use client";

import Link from "next/link";

import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";

export default function AccessControlPage() {
  const { session, isLoading } = useAdminSessionGuard();

  if (isLoading || !session) return <main className="page-shell"><p>Checking your session...</p></main>;

  return (
    <main className="page-shell">
      <Link className="back-link" href="/">Back</Link>
      <div className="page-intro">
        <p className="eyebrow">Access control</p>
        <h1>Manage access control</h1>
        <p>Create permissions, group them into permission sets, and attach those sets to business roles.</p>
      </div>
      <nav aria-label="Access control actions" className="link-list">
        <Link href="/access-control/permissions">Manage permissions</Link>
        <Link href="/access-control/permission-sets">Manage permission sets</Link>
        <Link href="/access-control/roles">Manage roles</Link>
      </nav>
    </main>
  );
}
