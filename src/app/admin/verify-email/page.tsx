"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { verifyAdminEmail } from "@/lib/admin-auth-api";
import { ApiError } from "@/lib/api-client";

type Outcome = { variant: "success" | "error"; title: string; message: string; actionLabel: string; actionPath: string };

function VerifyEmailContent() {
  const token = useSearchParams().get("token"); const router = useRouter(); const [outcome, setOutcome] = useState<Outcome>();
  const missingOutcome = !token ? { variant: "error" as const, title: "Invalid verification link", message: "This link is missing the verification token.", actionLabel: "Return home", actionPath: "/" } : undefined;
  useEffect(() => { if (token) void verifyAdminEmail(token).then((result) => setOutcome(result.account.status === "ACTIVE" ? { variant: "success", title: "Email verified", message: "Your administrator account is active. You can now sign in.", actionLabel: "Sign in", actionPath: "/admin/login" } : { variant: "success", title: "Email verified", message: "Your registration is now waiting for executive approval.", actionLabel: "Return home", actionPath: "/" })).catch((requestError: unknown) => setOutcome({ variant: "error", title: "We could not verify your email", message: requestError instanceof ApiError ? requestError.message : "Please request a new verification link.", actionLabel: "Return home", actionPath: "/" })); }, [token]);
  const visibleOutcome = outcome ?? missingOutcome;
  return <main className="outcome-page"><div className="processing-orb" /><p className="eyebrow">Email verification</p><h1>Verifying your secure link</h1><p>Please wait while we confirm your email address.</p>{visibleOutcome && <OutcomeModal {...visibleOutcome} onAction={() => router.push(visibleOutcome.actionPath)} onClose={() => router.push("/")} />}</main>;
}
export default function VerifyAdminEmailPage() { return <Suspense fallback={<main className="outcome-page"><p>Loading secure link...</p></main>}><VerifyEmailContent /></Suspense>; }
