"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";

const accessAreas = [
  { href: "/access-control/permissions", title: "Permissions", description: "Define the individual actions the system can authorize." },
  { href: "/access-control/permission-sets", title: "Permission sets", description: "Group related permissions into reusable access bundles." },
  { href: "/access-control/roles", title: "Roles", description: "Attach a permission set to a business responsibility." },
];

export default function AccessControlPage() {
  const { session, isLoading } = useAdminSessionGuard();

  if (isLoading || !session) return <main className="page-shell"><p>Checking your session...</p></main>;

  return (
    <AppShell eyebrow="Access control" title="Access control" subtitle="Define and manage access rules">
      <section className="access-area-grid">
        {accessAreas.map((area, index) => (
          <Link className="access-area-card" href={area.href} key={area.href}>
            <span className="access-area-number">0{index + 1}</span>
            <h2>{area.title}</h2>
            <p>{area.description}</p>
            <span className="access-area-link">Manage →</span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
