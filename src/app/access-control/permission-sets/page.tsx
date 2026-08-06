"use client";

import { FormEvent, useEffect, useState } from "react";

import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { AppShell } from "@/components/layout/app-shell";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { createPermissionSet, deletePermissionSet, listPermissions, listPermissionSets, updatePermissionSet } from "@/lib/access-control-api";
import type { Permission, PermissionSet } from "@/types/access-control.types";

import "../access-control-workspace.css";

type Outcome = { variant: "success" | "error"; title: string; message: string };

export default function PermissionSetsPage() {
  const { session, accessToken, isLoading } = useAdminSessionGuard();
  const [permissionSets, setPermissionSets] = useState<PermissionSet[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedSet, setSelectedSet] = useState<PermissionSet>();
  const [setToDelete, setSetToDelete] = useState<PermissionSet>();
  const [deletionReason, setDeletionReason] = useState("");
  const [outcome, setOutcome] = useState<Outcome>();
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!accessToken) return;

    try {
      const [sets, availablePermissions] = await Promise.all([listPermissionSets(accessToken), listPermissions(accessToken)]);
      setPermissionSets(sets);
      setPermissions(availablePermissions.filter((permission) => permission.status === "ACTIVE"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load permission sets.");
    }
  };

  useEffect(() => {
    if (accessToken) {
      void Promise.all([listPermissionSets(accessToken), listPermissions(accessToken)])
        .then(([sets, availablePermissions]) => {
          setPermissionSets(sets);
          setPermissions(availablePermissions.filter((permission) => permission.status === "ACTIVE"));
        })
        .catch((requestError: Error) => setError(requestError.message));
    }
  }, [accessToken]);

  const savePermissionSet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;

    const form = new FormData(event.currentTarget);
    const input = {
      name: form.get("name"),
      description: form.get("description"),
      involvementRole: form.get("involvementRole"),
      status: form.get("status"),
      permissionIds: form.getAll("permissionIds"),
    };

    try {
      const permissionSet = selectedSet
        ? await updatePermissionSet(selectedSet.id, input, accessToken)
        : await createPermissionSet(input, accessToken);
      setSelectedSet(permissionSet);
      await refresh();
      setOutcome({
        variant: "success",
        title: selectedSet ? "Permission set updated" : "Permission set created",
        message: "The permission set and its membership have been saved.",
      });
    } catch (requestError) {
      setOutcome({
        variant: "error",
        title: "Unable to save permission set",
        message: requestError instanceof Error ? requestError.message : "Please try again.",
      });
    }
  };

  const removePermissionSet = async () => {
    if (!accessToken || !setToDelete || !deletionReason.trim()) return;

    try {
      await deletePermissionSet(setToDelete.id, deletionReason.trim(), accessToken);
      if (selectedSet?.id === setToDelete.id) setSelectedSet(undefined);
      setSetToDelete(undefined);
      setDeletionReason("");
      await refresh();
      setOutcome({ variant: "success", title: "Permission set deleted", message: "The permission set has been deleted." });
    } catch (requestError) {
      setSetToDelete(undefined);
      setOutcome({
        variant: "error",
        title: "Unable to delete permission set",
        message: requestError instanceof Error ? requestError.message : "Please try again.",
      });
    }
  };

  if (isLoading || !session) return <main className="page-shell"><p>Checking your session...</p></main>;

  const selectedIds = new Set(selectedSet?.permissions.map((permission) => permission.id));

  return (
    <AppShell eyebrow="Access control" subtitle="Group related permissions into reusable access bundles." title="Permission sets">
      <section className="access-workspace">
        <aside className="access-workspace__list">
          <div className="access-workspace__toolbar">
            <button onClick={() => setSelectedSet(undefined)} type="button">+ New set</button>
          </div>
          {error && <p className="access-workspace__error">{error}</p>}
          <div className="access-workspace__items">
            {permissionSets.map((permissionSet) => (
              <button className={selectedSet?.id === permissionSet.id ? "access-workspace__item is-selected" : "access-workspace__item"} key={permissionSet.id} onClick={() => setSelectedSet(permissionSet)} type="button">
                <span className="access-workspace__meta"><span>{permissionSet.permissions.length} permissions</span><span>{permissionSet.status}</span></span>
                <strong>{permissionSet.name}</strong>
                <p>{permissionSet.description || "No description provided."}</p>
              </button>
            ))}
            {!permissionSets.length && !error && <p className="access-workspace__empty">No permission sets have been created yet.</p>}
          </div>
        </aside>

        <section className="access-workspace__editor">
          <div className="access-workspace__editor-header">
            <p>{selectedSet ? "Edit permission set" : "New permission set"}</p>
            <h2>{selectedSet?.name ?? "Create permission set"}</h2>
          </div>
          <form key={selectedSet?.id ?? "new"} onSubmit={(event) => void savePermissionSet(event)}>
            <div className="field-grid">
              <label>Name<input defaultValue={selectedSet?.name} name="name" required /></label>
              <label>Involvement role<input defaultValue={selectedSet?.involvementRole ?? ""} name="involvementRole" /></label>
              <label>Status<select defaultValue={selectedSet?.status ?? "ACTIVE"} name="status"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
            </div>
            <label className="feedback-modal__reason">Description<textarea defaultValue={selectedSet?.description ?? ""} name="description" rows={3} /></label>
            <fieldset className="access-workspace__checklist">
              <legend>Permissions</legend>
              {permissions.map((permission) => <label key={permission.id}><input defaultChecked={selectedIds.has(permission.id)} name="permissionIds" type="checkbox" value={permission.id} /> {permission.name} <span>{permission.function} / {permission.action}</span></label>)}
              {!permissions.length && <p className="access-workspace__empty">Create active permissions before creating a permission set.</p>}
            </fieldset>
            <div className="access-workspace__actions">
              <button type="submit">{selectedSet ? "Save changes" : "Create permission set"}</button>
              {selectedSet && <button className="delete-party-button" onClick={() => setSetToDelete(selectedSet)} type="button">Delete set</button>}
            </div>
          </form>
        </section>
      </section>
      {setToDelete && <ConfirmationModal cancelLabel="No, cancel" confirmLabel="Yes, delete" message="This action cannot be undone." onCancel={() => { setDeletionReason(""); setSetToDelete(undefined); }} onConfirm={() => void removePermissionSet()} onReasonChange={setDeletionReason} reason={deletionReason} reasonLabel="Reason for deletion" title={`Delete ${setToDelete.name}?`} variant="danger" />}
      {outcome && <OutcomeModal actionLabel="Continue" message={outcome.message} onAction={() => setOutcome(undefined)} onClose={() => setOutcome(undefined)} title={outcome.title} variant={outcome.variant} />}
    </AppShell>
  );
}
