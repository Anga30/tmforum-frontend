"use client";

import "../party-pagination.css";
import "../party-detail-panel.css";
import "../party-list-override.css";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { PartyCreateModal } from "@/components/party/party-create-modal";
import { PartyManagementPanel } from "@/components/party/party-management-panel";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { getParty, listAllParties } from "@/lib/party-api";
import type { Party, PartyType } from "@/types/party.types";

type PartyFilter = "ALL" | PartyType;

export default function PartiesPage() {
  const { session, accessToken, isLoading } = useAdminSessionGuard();
  const [parties, setParties] = useState<Party[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<PartyFilter>(() => {
    if (typeof window === "undefined") return "ALL";
    const requestedFilter = new URLSearchParams(window.location.search).get("filter");
    return requestedFilter === "ORGANIZATION" || requestedFilter === "INDIVIDUAL" ? requestedFilter : "ALL";
  });
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdPartyName, setCreatedPartyName] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedParty, setSelectedParty] = useState<Party>();
  const pageSize = 10;

  const refreshParties = useCallback(async () => {
    if (!accessToken) return;
    try { const result = await listAllParties(accessToken, pageSize, page * pageSize); setParties(result.items); setTotal(result.total); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load parties."); }
  }, [accessToken, page]);

  useEffect(() => {
    if (!accessToken) return;

    void Promise.resolve().then(refreshParties);
  }, [accessToken, refreshParties]);

  useEffect(() => {
    if (!accessToken) return;

    const query = new URLSearchParams(window.location.search);
    const selectedPartyId = query.get("selectedPartyId");
    const selectedPartyType = query.get("type");
    if (!selectedPartyId || (selectedPartyType !== "INDIVIDUAL" && selectedPartyType !== "ORGANIZATION")) return;

    void getParty(selectedPartyType, selectedPartyId, accessToken)
      .then(setSelectedParty)
      .catch((requestError: Error) => setError(requestError.message));
  }, [accessToken]);

  const filteredParties = useMemo(() => parties.filter((party) => {
    const name = party.individual?.displayName ?? party.organization?.legalName ?? "";
    const matchesType = filter === "ALL" || party.partyType === filter;
    const matchesSearch = `${name} ${party.email?.value ?? ""}`.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesSearch;
  }), [filter, parties, search]);

  if (isLoading || !session) return <main className="page-shell"><p>Checking your session...</p></main>;

  const organizationCount = parties.filter((party) => party.partyType === "ORGANIZATION").length;
  const individualCount = parties.filter((party) => party.partyType === "INDIVIDUAL").length;

  return (
    <AppShell eyebrow="Party management" title="Parties" subtitle="Organizations and individuals">
      <section className="party-page-layout"><div className="workspace-panel party-workspace">
        <div className="workspace-toolbar">
          <label className="search-field">
            <span className="sr-only">Search parties</span>
            <input onChange={(event) => setSearch(event.target.value)} placeholder="Search parties..." type="search" value={search} />
          </label>
          <button className="primary-link-button" onClick={() => setShowCreateModal(true)} type="button">+ New party</button>
        </div>
        <div className="workspace-tabs" aria-label="Filter party list">
          <button className={filter === "ALL" ? "is-active" : ""} onClick={() => setFilter("ALL")} type="button">All ({parties.length})</button>
          <button className={filter === "ORGANIZATION" ? "is-active" : ""} onClick={() => setFilter("ORGANIZATION")} type="button">Organizations ({organizationCount})</button>
          <button className={filter === "INDIVIDUAL" ? "is-active" : ""} onClick={() => setFilter("INDIVIDUAL")} type="button">Individuals ({individualCount})</button>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="party-console-list">
          {filteredParties.map((party) => {
            const name = party.individual?.displayName ?? party.organization?.legalName;

            return (
              <button className={`party-console-item party-select-button ${selectedParty?.id === party.id ? "is-selected" : ""}`} key={party.id} onClick={() => { if (accessToken) void getParty(party.partyType, party.id, accessToken).then(setSelectedParty); }} type="button">
                <span className="party-type-icon" aria-hidden="true">{party.partyType === "ORGANIZATION" ? "▥" : "♙"}</span>
                <span className="party-console-copy">
                  <strong>{name}</strong>
                  <small>{party.email?.value ?? "No email address"}</small>
                </span>
                <span className={`status-chip status-chip--${party.status.toLowerCase()}`}>{party.status.replaceAll("_", " ")}</span>
                <span aria-hidden="true">›</span>
              </button>
            );
          })}
          {!error && !filteredParties.length && <p className="empty-state">No parties match this view.</p>}
        </div>
        <div className="party-pagination"><button disabled={page === 0} onClick={() => setPage((current) => current - 1)} type="button">Previous</button><span>Showing {total ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, total)} of {total}</span><button disabled={(page + 1) * pageSize >= total} onClick={() => setPage((current) => current + 1)} type="button">Next</button></div>
      </div>{selectedParty && accessToken ? <PartyManagementPanel accessToken={accessToken} key={selectedParty.id} onClose={() => setSelectedParty(undefined)} onUpdated={setSelectedParty} party={selectedParty} /> : <aside className="party-detail-panel"><p className="empty-state">Select a party to view details.</p></aside>}</section>
      {showCreateModal && accessToken && <PartyCreateModal accessToken={accessToken} onClose={() => setShowCreateModal(false)} onCreated={(partyName) => { setShowCreateModal(false); setCreatedPartyName(partyName); void refreshParties(); }} />}
      {createdPartyName && <OutcomeModal actionLabel="Continue" message={`${createdPartyName} was created. Verify the contact email to activate the party.`} onAction={() => setCreatedPartyName("")} onClose={() => setCreatedPartyName("")} title="Party created" variant="success" />}
    </AppShell>
  );
}
