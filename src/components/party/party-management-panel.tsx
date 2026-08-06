"use client";

import "@/app/party-panel-management.css";
import "@/app/party-panel-polish.css";
import "@/app/party-panel-final.css";
import "@/app/party-panel-actions.css";
import "@/app/party-panel-action-row.css";
import "@/app/party-panel-address.css";

import { FormEvent, useEffect, useState } from "react";

import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { listRoles } from "@/lib/access-control-api";
import { assignPartyRole, deleteParty, getPartyRoles, revokePartyRole, suspendParty, unsuspendParty, updateParty } from "@/lib/party-api";
import type { Role } from "@/types/access-control.types";
import type { Party, PartyRoleData } from "@/types/party.types";

type ConfirmationAction = "SUSPEND" | "UNSUSPEND" | "DELETE" | "REVOKE";
type Outcome = { variant: "success" | "error"; title: string; message: string; closesPanel?: boolean };
type Props = { party: Party; accessToken: string; onUpdated: (party: Party) => void; onClose: () => void };

export function PartyManagementPanel({ party, accessToken, onUpdated, onClose }: Props) {
  const [roles, setRoles] = useState<PartyRoleData>({ roles: [], effectivePermissions: [] });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [roleId, setRoleId] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationAction>();
  const [reason, setReason] = useState("");
  const [revokeId, setRevokeId] = useState("");
  const [outcome, setOutcome] = useState<Outcome>();

  useEffect(() => {
    void getPartyRoles(party.partyType, party.id, accessToken).then(setRoles).catch(() => undefined);
  }, [accessToken, party.id, party.partyType]);

  useEffect(() => {
    void listRoles(accessToken).then(setAvailableRoles).catch(() => undefined);
  }, [accessToken]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const updated = await updateParty(
        party.partyType,
        party.id,
        Object.fromEntries(new FormData(event.currentTarget).entries()),
        accessToken,
      );
      onUpdated(updated);
      setOutcome({ variant: "success", title: "Party updated", message: "Party information has been saved." });
    } catch (error) {
      setOutcome({ variant: "error", title: "Unable to save party", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const executeConfirmation = async () => {
    if (!reason.trim() || !confirmation) return;

    try {
      if (confirmation === "DELETE") {
        await deleteParty(party.partyType, party.id, reason, accessToken);
        setOutcome({ variant: "success", title: "Party deleted", message: "The party has been deleted.", closesPanel: true });
      } else if (confirmation === "SUSPEND") {
        onUpdated(await suspendParty(party.partyType, party.id, reason, accessToken));
        setOutcome({ variant: "success", title: "Party suspended", message: "The party has been suspended." });
      } else if (confirmation === "UNSUSPEND") {
        onUpdated(await unsuspendParty(party.partyType, party.id, reason, accessToken));
        setOutcome({ variant: "success", title: "Party reactivated", message: "The party is active and can now be managed." });
      } else {
        setRoles(await revokePartyRole(party.partyType, party.id, revokeId, reason, accessToken));
        setOutcome({ variant: "success", title: "Role revoked", message: "The role has been revoked from this party." });
      }

      setConfirmation(undefined);
      setReason("");
    } catch (error) {
      setConfirmation(undefined);
      setOutcome({ variant: "error", title: "Unable to complete action", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const assignRole = async () => {
    if (!roleId) {
      setOutcome({ variant: "error", title: "Select a role", message: "Choose a role before assigning it to this party." });
      return;
    }

    try {
      setRoles(await assignPartyRole(party.partyType, party.id, roleId, accessToken));
      setRoleId("");
      setOutcome({ variant: "success", title: "Role assigned", message: "The party permissions have been updated." });
    } catch (error) {
      setOutcome({ variant: "error", title: "Unable to assign role", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const closeOutcome = () => {
    const shouldClosePanel = outcome?.closesPanel;
    setOutcome(undefined);
    if (shouldClosePanel) onClose();
  };

  const individual = party.individual;
  const organization = party.organization;
  const isActive = party.status === "ACTIVE";
  const isSuspended = party.status === "SUSPENDED";
  const isPending = !isActive && !isSuspended;

  return (
    <aside className="party-detail-panel">
      <header>
        <div>
          <p className="eyebrow">{party.partyType}</p>
          <h2>{individual?.displayName ?? organization?.legalName}</h2>
        </div>
        <button className="detail-close" onClick={onClose} type="button">×</button>
      </header>

      <form className="panel-management-form" onSubmit={(event) => void submit(event)}>
        {isSuspended && <p className="party-read-only-notice">This party is suspended and cannot be edited or assigned roles until it is reactivated.</p>}
        {isPending && <p className="party-read-only-notice">This party is awaiting email verification. You can correct its details, but roles and suspension are unavailable until it becomes active.</p>}
        {party.partyType === "INDIVIDUAL" ? <>
          <label>First name<input defaultValue={individual?.givenName} disabled={isSuspended} name="givenName" /></label>
          <label>Middle name<input defaultValue={individual?.middleName ?? ""} disabled={isSuspended} name="middleName" /></label>
          <label>Surname<input defaultValue={individual?.familyName} disabled={isSuspended} name="familyName" /></label>
          <label>Date of birth<input defaultValue={individual?.birthDate ?? ""} disabled={isSuspended} name="birthDate" type="date" /></label>
          <label>Gender<input defaultValue={individual?.gender ?? ""} disabled={isSuspended} name="gender" /></label>
          <label>Nationality<input defaultValue={individual?.nationality ?? ""} disabled={isSuspended} name="nationality" /></label>
        </> : <>
          <label>Legal name<input defaultValue={organization?.legalName} disabled={isSuspended} name="legalName" /></label>
          <label>Trading name<input defaultValue={organization?.tradingName ?? ""} disabled={isSuspended} name="tradingName" /></label>
        </>}
        <label>Email<input defaultValue={party.email?.value ?? ""} disabled={isSuspended} name="email" required type="email" /></label>
        <label>Phone<input defaultValue={party.phone?.value ?? ""} disabled={isSuspended} name="phone" /></label>
        <label>Address<textarea defaultValue={party.address?.value ?? ""} disabled={isSuspended} name="address" rows={2} /></label>
        <button disabled={isSuspended} type="submit">Save changes</button>
        {isSuspended && <button onClick={() => setConfirmation("UNSUSPEND")} type="button">Reactivate party</button>}
        {isActive && <button onClick={() => setConfirmation("SUSPEND")} type="button">Suspend party</button>}
        <button onClick={() => setConfirmation("DELETE")} type="button">Delete party</button>
      </form>

      <section className="panel-roles">
        <h3>Roles and permissions</h3>
        {isActive && <><select onChange={(event) => setRoleId(event.target.value)} value={roleId}>
          <option value="">Select a role</option>
          {availableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
        </select>
        <button onClick={() => void assignRole()} type="button">Assign role</button></>}
        {roles.roles.map((role) => <p key={role.id}>{role.role.name} {isActive && <button onClick={() => { setRevokeId(role.id); setConfirmation("REVOKE"); }} type="button">Revoke</button>}</p>)}
        <p>{roles.effectivePermissions.map((permission) => permission.name).join(", ") || "No active permissions."}</p>
      </section>

      {confirmation && <ConfirmationModal cancelLabel="Cancel" confirmLabel="Confirm" message="A reason is required." onCancel={() => { setConfirmation(undefined); setReason(""); }} onConfirm={() => void executeConfirmation()} onReasonChange={setReason} reason={reason} reasonLabel="Reason" title={confirmation === "DELETE" ? "Delete party?" : confirmation === "SUSPEND" ? "Suspend party?" : confirmation === "UNSUSPEND" ? "Reactivate party?" : "Revoke role?"} variant={confirmation === "DELETE" || confirmation === "REVOKE" ? "danger" : "warning"} />}
      {outcome && <OutcomeModal actionLabel="Continue" message={outcome.message} onAction={closeOutcome} onClose={closeOutcome} title={outcome.title} variant={outcome.variant} />}
    </aside>
  );
}
