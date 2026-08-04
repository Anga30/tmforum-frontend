"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { verifyPartyEmail } from "@/lib/party-api";

function Content() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (token) {
      void verifyPartyEmail(token)
        .then(() => setMessage("verified"))
        .catch((error: Error) => setMessage(error.message));
    }
  }, [token]);

  const visibleMessage =
    message ?? (!token ? "This link is missing its verification token." : undefined);
  const success = visibleMessage === "verified";

  return (
    <main className="outcome-page">
      <p className="eyebrow">Party verification</p>
      <h1>Verifying email</h1>
      {visibleMessage && (
        <OutcomeModal
          variant={success ? "success" : "error"}
          title={success ? "Email verified" : "Verification failed"}
          message={success ? "The party is now active." : visibleMessage}
          actionLabel={success ? "Done" : "Back to home"}
          onAction={() => {
            if (success) {
              window.close();
              return;
            }

            router.push("/");
          }}
          onClose={() => router.push("/")}
        />
      )}
    </main>
  );
}
export default function VerifyPartyEmailPage() { return <Suspense fallback={<main className="outcome-page">Loading link...</main>}><Content /></Suspense>; }
