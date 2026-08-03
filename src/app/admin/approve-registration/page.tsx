"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { approveAdminRegistration } from "@/lib/admin-auth-api";
import { ApiError } from "@/lib/api-client";

type Outcome = { variant: "success" | "error"; title: string; message: string };
function ApproveRegistrationContent() {
  const token = useSearchParams().get("token"); const router = useRouter(); const [outcome, setOutcome] = useState<Outcome>();
  const missingOutcome = !token ? { variant: "error" as const, title: "Invalid approval link", message: "This link is missing the approval token." } : undefined;
  useEffect(() => { if (token) void approveAdminRegistration(token).then(() => setOutcome({ variant: "success", title: "Registration approved", message: "The administrator account is active and the applicant has been notified." })).catch((requestError: unknown) => setOutcome({ variant: "error", title: "We could not approve this registration", message: requestError instanceof ApiError ? requestError.message : "Please try again using a valid approval link." })); }, [token]);
  const visibleOutcome = outcome ?? missingOutcome;
  return <main className="outcome-page"><div className="processing-orb" /><p className="eyebrow">Executive approval</p><h1>Processing administrator registration</h1><p>Please wait while we securely record your decision.</p>{visibleOutcome && <OutcomeModal {...visibleOutcome} actionLabel="Return home" onAction={() => router.push("/")} onClose={() => router.push("/")} />}</main>;
}
export default function ApproveRegistrationPage() { return <Suspense fallback={<main className="outcome-page"><p>Loading secure link...</p></main>}><ApproveRegistrationContent /></Suspense>; }
