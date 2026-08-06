"use client";

import { FormEvent, useEffect, useState } from "react";

import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { AppShell } from "@/components/layout/app-shell";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { createRole, deleteRole, listPermissionSets, listRoles, updateRole } from "@/lib/access-control-api";
import type { PermissionSet, Role } from "@/types/access-control.types";

import "../access-control-workspace.css";

type Outcome = { variant: "success" | "error"; title: string; message: string };

export default function RolesPage() {
  const { session, accessToken, isLoading } = useAdminSessionGuard();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionSets, setPermissionSets] = useState<PermissionSet[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role>();
  const [roleToDelete, setRoleToDelete] = useState<Role>();
  const [deletionReason, setDeletionReason] = useState("");
  const [outcome, setOutcome] = useState<Outcome>();

  const refresh = async () => {
    if (!accessToken) return;

    const [roleItems, setItems] = await Promise.all([listRoles(accessToken), listPermissionSets(accessToken)]);
    setRoles(roleItems);
    setPermissionSets(setItems.filter((permissionSet) => permissionSet.status === "ACTIVE"));
  };

  useEffect(() => {
    if (accessToken) {
      void Promise.all([listRoles(accessToken), listPermissionSets(accessToken)])
        .then(([roleItems, setItems]) => {
          setRoles(roleItems);
          setPermissionSets(setItems.filter((permissionSet) => permissionSet.status === "ACTIVE"));
        })
        .catch((error: Error) => {
          setOutcome({ variant: "error", title: "Unable to load roles", message: error.message });
        });
    }
  }, [accessToken]);

  const saveRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;

    const input = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const role = selectedRole
        ? await updateRole(selectedRole.id, input, accessToken)
        : await createRole(input, accessToken);

      setSelectedRole(role);
      await refresh();
      setOutcome({
        variant: "success",
        title: selectedRole ? "Role updated" : "Role created",
        message: "The role and its effective permissions have been saved.",
      });
    } catch (error) {
      setOutcome({ variant: "error", title: "Unable to save role", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const removeRole = async () => {
    if (!accessToken || !roleToDelete || !deletionReason.trim()) return;

    try {
      await deleteRole(roleToDelete.id, deletionReason.trim(), accessToken);
      if (selectedRole?.id === roleToDelete.id) setSelectedRole(undefined);
      setRoleToDelete(undefined);
      setDeletionReason("");
      await refresh();
      setOutcome({ variant: "success", title: "Role deleted", message: "The role has been deleted." });
    } catch (error) {
      setRoleToDelete(undefined);
      setOutcome({ variant: "error", title: "Unable to delete role", message: error instanceof Error ? error.message : "Please try again." });
    }
  };

  if (isLoading || !session) return <main className="page-shell"><p>Checking your session...</p></main>;

  return (
    <AppShell eyebrow="Access control" subtitle="Attach one permission set to each business responsibility." title="Roles">
      <section className="access-workspace">
        <aside className="access-workspace__list">
          <div className="access-workspace__toolbar">
            <button onClick={() => setSelectedRole(undefined)} type="button">+ New role</button>
          </div>
          <div className="access-workspace__items">
            {roles.map((role) => (
              <button className={selectedRole?.id === role.id ? "access-workspace__item is-selected" : "access-workspace__item"} key={role.id} onClick={() => setSelectedRole(role)} type="button">
                <span className="access-workspace__meta"><span>{role.permissionSet.name}</span><span>{role.status}</span></span>
                <strong>{role.name}</strong>
                <p>{role.description || `${role.permissionSet.permissions.length} effective permissions`}</p>
              </button>
            ))}
            {!roles.length && <p className="access-workspace__empty">No roles have been created yet.</p>}
          </div>
        </aside>

        <section className="access-workspace__editor">
          <div className="access-workspace__editor-header">
            <p>{selectedRole ? "Edit role" : "New role"}</p>
            <h2>{selectedRole?.name ?? "Create role"}</h2>
          </div>
          <form key={selectedRole?.id ?? "new"} onSubmit={(event) => void saveRole(event)}>
            <div className="field-grid">
              <label>Name<input defaultValue={selectedRole?.name} name="name" required /></label>
              <label>Permission set<select defaultValue={selectedRole?.permissionSet.id ?? ""} name="permissionSetId" required><option disabled value="">Select a permission set</option>{permissionSets.map((permissionSet) => <option key={permissionSet.id} value={permissionSet.id}>{permissionSet.name}</option>)}</select></label>
              <label>Status<select defaultValue={selectedRole?.status ?? "ACTIVE"} name="status"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
            </div>
            <label className="feedback-modal__reason">Description<textarea defaultValue={selectedRole?.description ?? ""} name="description" rows={4} /></label>
            <div className="access-workspace__actions">
              <button type="submit">{selectedRole ? "Save changes" : "Create role"}</button>
              {selectedRole && <button className="delete-party-button" onClick={() => setRoleToDelete(selectedRole)} type="button">Delete role</button>}
            </div>
          </form>
        </section>
      </section>
      {roleToDelete && <ConfirmationModal cancelLabel="No, cancel" confirmLabel="Yes, delete" message="This action cannot be undone." onCancel={() => { setDeletionReason(""); setRoleToDelete(undefined); }} onConfirm={() => void removeRole()} onReasonChange={setDeletionReason} reason={deletionReason} reasonLabel="Reason for deletion" title={`Delete ${roleToDelete.name}?`} variant="danger" />}
      {outcome && <OutcomeModal actionLabel="Continue" message={outcome.message} onAction={() => setOutcome(undefined)} onClose={() => setOutcome(undefined)} title={outcome.title} variant={outcome.variant} />}
    </AppShell>
  );
}
