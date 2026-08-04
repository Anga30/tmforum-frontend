"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { createPermission, deletePermission, listPermissions, updatePermission } from "@/lib/access-control-api";
import type { Permission } from "@/types/access-control.types";

type Outcome = { variant: "success" | "error"; title: string; message: string };

export default function PermissionsPage() {
  const { session, accessToken, isLoading } = useAdminSessionGuard();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<Permission>();
  const [permissionToDelete, setPermissionToDelete] = useState<Permission>();
  const [deletionReason, setDeletionReason] = useState("");
  const [outcome, setOutcome] = useState<Outcome>();
  const [error, setError] = useState("");

  const refreshPermissions = async () => {
    if (!accessToken) return;
    try {
      setPermissions(await listPermissions(accessToken));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load permissions.");
    }
  };

  useEffect(() => {
    if (accessToken) {
      void listPermissions(accessToken)
        .then(setPermissions)
        .catch((requestError: Error) => setError(requestError.message));
    }
  }, [accessToken]);

  const savePermission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    const input = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const permission = selectedPermission
        ? await updatePermission(selectedPermission.id, input, accessToken)
        : await createPermission(input, accessToken);
      setSelectedPermission(permission);
      await refreshPermissions();
      setOutcome({ variant: "success", title: selectedPermission ? "Permission updated" : "Permission created", message: "The permission definition has been saved." });
    } catch (requestError) {
      setOutcome({ variant: "error", title: "Unable to save permission", message: requestError instanceof Error ? requestError.message : "Please try again." });
    }
  };

  const removePermission = async () => {
    if (!accessToken || !permissionToDelete || !deletionReason.trim()) return;
    try {
      await deletePermission(permissionToDelete.id, deletionReason.trim(), accessToken);
      if (selectedPermission?.id === permissionToDelete.id) setSelectedPermission(undefined);
      setPermissionToDelete(undefined);
      setDeletionReason("");
      await refreshPermissions();
      setOutcome({ variant: "success", title: "Permission deleted", message: "The permission definition has been deleted." });
    } catch (requestError) {
      setPermissionToDelete(undefined);
      setOutcome({ variant: "error", title: "Unable to delete permission", message: requestError instanceof Error ? requestError.message : "Please try again." });
    }
  };

  if (isLoading || !session) return <main className="page-shell"><p>Checking your session...</p></main>;

  return (
    <main className="page-shell">
      <Link className="back-link" href="/">Back</Link><p><Link href="/access-control/permission-sets">Manage permission sets</Link></p>
      <div className="page-intro"><p className="eyebrow">Access control</p><h1>Permissions</h1><p>Define the individual actions that can later be grouped into permission sets and roles.</p></div>
      <section className="access-control-layout">
        <div>
          <button onClick={() => setSelectedPermission(undefined)} type="button">Create permission</button>
          {error && <p className="error">{error}</p>}
          <div className="party-list">
            {permissions.map((permission) => <article className="party-card" key={permission.id}><p className="eyebrow">{permission.function}</p><h2>{permission.name}</h2><p>Action: {permission.action}</p><p>{permission.description}</p><div className="party-form-actions"><button onClick={() => setSelectedPermission(permission)} type="button">Edit</button><button className="delete-party-button" onClick={() => setPermissionToDelete(permission)} type="button">Delete</button></div></article>)}
            {!permissions.length && !error && <p className="field-help">No permissions have been created yet.</p>}
          </div>
        </div>
        <form className="form-card" key={selectedPermission?.id ?? "new"} onSubmit={(event) => void savePermission(event)}>
          <h2>{selectedPermission ? "Edit permission" : "Create permission"}</h2>
          <div className="field-grid"><label>Name<input defaultValue={selectedPermission?.name} name="name" placeholder="party.view" required /></label><label>Function<input defaultValue={selectedPermission?.function} name="function" placeholder="party" required /></label><label>Action<input defaultValue={selectedPermission?.action} name="action" placeholder="view" required /></label><label>Status<select defaultValue={selectedPermission?.status ?? "ACTIVE"} name="status"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label></div>
          <label className="feedback-modal__reason">Description<textarea defaultValue={selectedPermission?.description ?? ""} name="description" rows={4} /></label>
          <button type="submit">{selectedPermission ? "Save changes" : "Create permission"}</button>
        </form>
      </section>
      {permissionToDelete && <ConfirmationModal cancelLabel="No, cancel" confirmLabel="Yes, delete" message="This action cannot be undone." onCancel={() => { setDeletionReason(""); setPermissionToDelete(undefined); }} onConfirm={() => void removePermission()} onReasonChange={setDeletionReason} reason={deletionReason} reasonLabel="Reason for deletion" title={`Delete ${permissionToDelete.name}?`} variant="danger" />}
      {outcome && <OutcomeModal actionLabel="Continue" message={outcome.message} onAction={() => setOutcome(undefined)} onClose={() => setOutcome(undefined)} title={outcome.title} variant={outcome.variant} />}
    </main>
  );
}
