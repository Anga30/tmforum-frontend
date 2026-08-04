"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { createRole, deleteRole, listPermissionSets, listRoles, updateRole } from "@/lib/access-control-api";
import type { PermissionSet, Role } from "@/types/access-control.types";

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
        .catch((error: Error) => setOutcome({ variant: "error", title: "Unable to load roles", message: error.message }));
    }
  }, [accessToken]);

  const saveRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    const input = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const role = selectedRole ? await updateRole(selectedRole.id, input, accessToken) : await createRole(input, accessToken);
      setSelectedRole(role);
      await refresh();
      setOutcome({ variant: "success", title: selectedRole ? "Role updated" : "Role created", message: "The role and its effective permissions have been saved." });
    } catch (error) { setOutcome({ variant: "error", title: "Unable to save role", message: error instanceof Error ? error.message : "Please try again." }); }
  };

  const removeRole = async () => {
    if (!accessToken || !roleToDelete || !deletionReason.trim()) return;
    try { await deleteRole(roleToDelete.id, deletionReason.trim(), accessToken); if (selectedRole?.id === roleToDelete.id) setSelectedRole(undefined); setRoleToDelete(undefined); setDeletionReason(""); await refresh(); setOutcome({ variant: "success", title: "Role deleted", message: "The role has been deleted." }); }
    catch (error) { setRoleToDelete(undefined); setOutcome({ variant: "error", title: "Unable to delete role", message: error instanceof Error ? error.message : "Please try again." }); }
  };

  if (isLoading || !session) return <main className="page-shell"><p>Checking your session...</p></main>;
  return <main className="page-shell"><Link className="back-link" href="/access-control/permission-sets">Back to permission sets</Link><div className="page-intro"><p className="eyebrow">Access control</p><h1>Roles</h1><p>Attach one Permission Set to each business Role.</p></div><section className="access-control-layout"><div><button onClick={() => setSelectedRole(undefined)} type="button">Create role</button><div className="party-list">{roles.map((role) => <article className="party-card" key={role.id}><p className="eyebrow">{role.permissionSet.name}</p><h2>{role.name}</h2><p>{role.description}</p><p>{role.permissionSet.permissions.map((permission) => permission.name).join(", ")}</p><div className="party-form-actions"><button onClick={() => setSelectedRole(role)} type="button">Edit</button><button className="delete-party-button" onClick={() => setRoleToDelete(role)} type="button">Delete</button></div></article>)}{!roles.length && <p className="field-help">No roles have been created yet.</p>}</div></div><form className="form-card" key={selectedRole?.id ?? "new"} onSubmit={(event) => void saveRole(event)}><h2>{selectedRole ? "Edit role" : "Create role"}</h2><div className="field-grid"><label>Name<input defaultValue={selectedRole?.name} name="name" required /></label><label>Permission set<select defaultValue={selectedRole?.permissionSet.id ?? ""} name="permissionSetId" required><option disabled value="">Select a permission set</option>{permissionSets.map((permissionSet) => <option key={permissionSet.id} value={permissionSet.id}>{permissionSet.name}</option>)}</select></label><label>Status<select defaultValue={selectedRole?.status ?? "ACTIVE"} name="status"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label></div><label className="feedback-modal__reason">Description<textarea defaultValue={selectedRole?.description ?? ""} name="description" rows={4} /></label><button type="submit">{selectedRole ? "Save changes" : "Create role"}</button></form></section>{roleToDelete && <ConfirmationModal cancelLabel="No, cancel" confirmLabel="Yes, delete" message="This action cannot be undone." onCancel={() => { setDeletionReason(""); setRoleToDelete(undefined); }} onConfirm={() => void removeRole()} onReasonChange={setDeletionReason} reason={deletionReason} reasonLabel="Reason for deletion" title={`Delete ${roleToDelete.name}?`} variant="danger" />}{outcome && <OutcomeModal actionLabel="Continue" message={outcome.message} onAction={() => setOutcome(undefined)} onClose={() => setOutcome(undefined)} title={outcome.title} variant={outcome.variant} />}</main>;
}
