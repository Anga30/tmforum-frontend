"use client";

import "../../party-detail.css";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { AppShell } from "@/components/layout/app-shell";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { assignPartyRole, deleteParty, getParty, getPartyRoles, revokePartyRole, suspendParty, unsuspendParty, updateParty } from "@/lib/party-api";
import { listRoles } from "@/lib/access-control-api";
import type { Role } from "@/types/access-control.types";
import type { Party, PartyRoleData, PartyType } from "@/types/party.types";

type Outcome = {
  variant: "success" | "error";
  title: string;
  message: string;
  actionLabel: string;
  returnToPartyList?: boolean;
};

type ConfirmationAction = "DELETE" | "SUSPEND" | "UNSUSPEND" | "REVOKE_ROLE";

export default function PartyDetailPage() {
  const params = useParams<{ partyId: string }>();
  const router = useRouter();
  const type = useSearchParams().get("type") as PartyType;
  const { session, accessToken, isLoading } = useAdminSessionGuard();
  const [party, setParty] = useState<Party>();
  const [pageError, setPageError] = useState("");
  const [outcome, setOutcome] = useState<Outcome>();
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>();
  const [actionReason, setActionReason] = useState("");
  const [partyRoleData, setPartyRoleData] = useState<PartyRoleData>({ roles: [], effectivePermissions: [] });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [roleIdToAssign, setRoleIdToAssign] = useState("");
  const [assignmentIdToRevoke, setAssignmentIdToRevoke] = useState("");

  useEffect(() => {
    if (accessToken && type) {
      void getParty(type, params.partyId, accessToken)
        .then(setParty)
        .catch((error: Error) => setPageError(error.message));
    }
  }, [accessToken, params.partyId, type]);

  useEffect(() => {
    if (accessToken && type) {
      void Promise.all([getPartyRoles(type, params.partyId, accessToken), listRoles(accessToken)])
        .then(([roles, definitions]) => { setPartyRoleData(roles); setAvailableRoles(definitions); })
        .catch(() => undefined);
    }
  }, [accessToken, params.partyId, type]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || !type || !party) return;

    const input = Object.fromEntries(new FormData(event.currentTarget).entries());
    const emailChanged = input.email !== party.email?.value;

    try {
      setParty(await updateParty(type, params.partyId, input, accessToken));
      setOutcome({
        variant: "success",
        title: "Party updated successfully",
        message: emailChanged
          ? "The new email address must be verified before the party becomes active."
          : "The party information has been updated.",
        actionLabel: "Continue",
      });
    } catch (error) {
      setOutcome({
        variant: "error",
        title: "Unable to update party",
        message: error instanceof Error ? error.message : "Please try again.",
        actionLabel: "Close",
      });
    }
  };

  const confirmAction = async () => {
    if (!accessToken || !type || !confirmationAction || !actionReason.trim()) return;

    const action = confirmationAction;
    const reason = actionReason.trim();
    setConfirmationAction(undefined);

    try {
      if (action === "REVOKE_ROLE") {
        setPartyRoleData(await revokePartyRole(type, params.partyId, assignmentIdToRevoke, reason, accessToken));
        setOutcome({ variant: "success", title: "Role revoked", message: "The role has been revoked from this party.", actionLabel: "Continue" });
      } else if (action === "DELETE") {
        await deleteParty(type, params.partyId, reason, accessToken);
        setOutcome({
          variant: "success",
          title: "Party deleted successfully",
          message: "The party has been deleted.",
          actionLabel: "Back to parties",
          returnToPartyList: true,
        });
      } else {
        const updatedParty = action === "SUSPEND"
          ? await suspendParty(type, params.partyId, reason, accessToken)
          : await unsuspendParty(type, params.partyId, reason, accessToken);
        setParty(updatedParty);
        setOutcome({
          variant: "success",
          title: action === "SUSPEND" ? "Party suspended successfully" : "Party unsuspended successfully",
          message: action === "SUSPEND"
            ? "The party can no longer be edited until it is unsuspended."
            : "The party is active and can be managed again.",
          actionLabel: "Continue",
        });
      }
      setActionReason("");
    } catch (error) {
      setOutcome({
        variant: "error",
        title: action === "DELETE" ? "Unable to delete party" : action === "REVOKE_ROLE" ? "Unable to revoke role" : "Unable to change party status",
        message: error instanceof Error ? error.message : "Please try again.",
        actionLabel: "Close",
      });
    }
  };

  const assignSelectedRole = async () => {
    if (!accessToken || !type || !roleIdToAssign) return;
    try {
      setPartyRoleData(await assignPartyRole(type, params.partyId, roleIdToAssign, accessToken));
      setRoleIdToAssign("");
      setOutcome({ variant: "success", title: "Role assigned", message: "The party's effective permissions have been updated.", actionLabel: "Continue" });
    } catch (error) {
      setOutcome({ variant: "error", title: "Unable to assign role", message: error instanceof Error ? error.message : "Please try again.", actionLabel: "Close" });
    }
  };

  const closeOutcome = () => {
    if (outcome?.returnToPartyList) {
      router.push("/parties");
      return;
    }

    setOutcome(undefined);
  };

  if (isLoading || !session) {
    return <main className="page-shell"><p>Checking your session...</p></main>;
  }

  if (!party) {
    return <main className="page-shell"><Link href="/parties">Back</Link><p>{pageError || (!type ? "Party details are unavailable." : "Loading party...")}</p></main>;
  }

  const individual = party.individual;
  const organization = party.organization;
  const isSuspended = party.status === "SUSPENDED";
  const isActive = party.status === "ACTIVE";
  const assignedRoleIds = new Set(partyRoleData.roles.map((assignment) => assignment.role.name));
  const assignableRoles = availableRoles.filter((role) => role.status === "ACTIVE" && !assignedRoleIds.has(role.name));
  const confirmationDetails = confirmationAction === "DELETE"
    ? { variant: "danger" as const, title: "Are you sure you want to delete this party?", message: "This action cannot be undone.", reasonLabel: "Reason for deletion", confirmLabel: "Yes, delete" }
    : confirmationAction === "SUSPEND"
      ? { variant: "warning" as const, title: "Are you sure you want to suspend this party?", message: "The party cannot be edited until it is unsuspended.", reasonLabel: "Reason for suspension", confirmLabel: "Yes, suspend" }
      : confirmationAction === "REVOKE_ROLE"
        ? { variant: "danger" as const, title: "Are you sure you want to revoke this role?", message: "The party will no longer receive permissions from this role.", reasonLabel: "Reason for revocation", confirmLabel: "Yes, revoke" }
      : { variant: "warning" as const, title: "Are you sure you want to unsuspend this party?", message: "The party will become active and can be managed again.", reasonLabel: "Reason for unsuspension", confirmLabel: "Yes, unsuspend" };

  return (
    <AppShell eyebrow="Party management" title={individual?.displayName ?? organization?.legalName ?? "Party"} subtitle={party.partyType === "ORGANIZATION" ? "Organization" : "Individual"}>
      <Link className="back-link" href="/parties">← Back to parties</Link>
      <section className="party-detail-header"><span className={`status-chip status-chip--${party.status.toLowerCase()}`}>{party.status.replaceAll("_", " ")}</span><span>{party.email?.value}</span></section>
      {isSuspended ? <p className="error">This party is suspended and cannot be edited.</p> : <p className="field-help">Changing the email address requires the new email address to be verified.</p>}
      <form className="form-card party-detail-card" onSubmit={(event) => void submit(event)}>
        <fieldset disabled={isSuspended}>
          {type === "INDIVIDUAL" ? (
            <div className="field-grid">
              <label>Given name<input defaultValue={individual?.givenName} name="givenName" /></label>
              <label>Middle name<input defaultValue={individual?.middleName ?? ""} name="middleName" /></label>
              <label>Family name<input defaultValue={individual?.familyName} name="familyName" /></label>
              <label>Birth date<input defaultValue={individual?.birthDate ?? ""} name="birthDate" type="date" /></label>
              <label>Gender<input defaultValue={individual?.gender ?? ""} name="gender" /></label>
              <label>Nationality<input defaultValue={individual?.nationality ?? ""} name="nationality" /></label>
            </div>
          ) : (
            <div className="field-grid">
              <label>Legal name<input defaultValue={organization?.legalName} name="legalName" /></label>
              <label>Trading name<input defaultValue={organization?.tradingName ?? ""} name="tradingName" /></label>
              <label>Organization type<input defaultValue={organization?.organizationType ?? ""} name="organizationType" /></label>
            </div>
          )}
          <fieldset className="field-group">
            <legend>Contact media</legend>
            <div className="field-grid">
              <label>Email address<input defaultValue={party.email?.value ?? ""} name="email" required type="email" /></label>
              <label>Phone number<input defaultValue={party.phone?.value ?? ""} name="phone" type="tel" /></label>
              <label>Physical address<textarea defaultValue={party.address?.value ?? ""} name="address" rows={3} /></label>
            </div>
          </fieldset>
        </fieldset>
        <div className="party-form-actions">
          {!isSuspended && <button type="submit">Save changes</button>}
          {isActive && <button onClick={() => setConfirmationAction("SUSPEND")} type="button">Suspend party</button>}
          {isSuspended && <button onClick={() => setConfirmationAction("UNSUSPEND")} type="button">Unsuspend party</button>}
          <button className="delete-party-button" onClick={() => setConfirmationAction("DELETE")} type="button">Delete party</button>
        </div>
      </form>
      <section className="form-card party-detail-card">
        <h2>Roles and permissions</h2>
        {isActive && <div className="party-form-actions"><select onChange={(event) => setRoleIdToAssign(event.target.value)} value={roleIdToAssign}><option value="">Select a role</option>{assignableRoles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select><button disabled={!roleIdToAssign} onClick={() => void assignSelectedRole()} type="button">Assign role</button></div>}
        <div><h3>Active roles</h3>{partyRoleData.roles.length ? partyRoleData.roles.map((assignment) => <div className="party-card" key={assignment.id}><strong>{assignment.role.name}</strong><button className="delete-party-button" onClick={() => { setAssignmentIdToRevoke(assignment.id); setConfirmationAction("REVOKE_ROLE"); }} type="button">Revoke role</button></div>) : <p className="field-help">No roles are assigned.</p>}</div>
        <div><h3>Effective permissions</h3>{partyRoleData.effectivePermissions.length ? <p>{partyRoleData.effectivePermissions.map((permission) => permission.name).join(", ")}</p> : <p className="field-help">No active permissions.</p>}</div>
      </section>
      {confirmationAction && (
        <ConfirmationModal
          cancelLabel="No, cancel"
          confirmLabel={confirmationDetails.confirmLabel}
          message={confirmationDetails.message}
          onCancel={() => {
            setActionReason("");
            setConfirmationAction(undefined);
          }}
          onConfirm={() => void confirmAction()}
          onReasonChange={setActionReason}
          reason={actionReason}
          reasonLabel={confirmationDetails.reasonLabel}
          title={confirmationDetails.title}
          variant={confirmationDetails.variant}
        />
      )}
      {outcome && (
        <OutcomeModal
          actionLabel={outcome.actionLabel}
          message={outcome.message}
          onAction={closeOutcome}
          onClose={closeOutcome}
          title={outcome.title}
          variant={outcome.variant}
        />
      )}
    </AppShell>
  );
}
