"use client";

import { useRouter } from "next/navigation";

import { PartyCreateModal } from "@/components/party/party-create-modal";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";

export default function NewPartyPage() {
  const router = useRouter();
  const { session, accessToken, isLoading } = useAdminSessionGuard();

  if (isLoading || !session || !accessToken) return <main className="page-shell"><p>Checking your session...</p></main>;

  return <PartyCreateModal accessToken={accessToken} onClose={() => router.push("/parties")} onCreated={() => router.push("/parties")} />;
}
