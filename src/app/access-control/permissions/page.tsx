"use client";

import { FormEvent, useEffect, useState } from "react";

import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import { OutcomeModal } from "@/components/feedback/outcome-modal";
import { AppShell } from "@/components/layout/app-shell";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { createPermission, deletePermission, getPermissionCatalog, listPermissions, updatePermission } from "@/lib/access-control-api";
import type { Permission, PermissionCatalog } from "@/types/access-control.types";

import "../access-control-workspace.css";

type Outcome = { variant: "success" | "error"; title: string; message: string };

export default function PermissionsPage() {
  const { session, accessToken, isLoading } = useAdminSessionGuard();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalog>();
  const [selectedPermission, setSelectedPermission] = useState<Permission>();
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
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
      void Promise.all([listPermissions(accessToken), getPermissionCatalog(accessToken)])
        .then(([availablePermissions, permissionCatalog]) => {
          setPermissions(availablePermissions);
          setCatalog(permissionCatalog);
        })
        .catch((requestError: Error) => setError(requestError.message));
    }
  }, [accessToken]);

  const resourceValue = resource || catalog?.resources[0]?.value || "";
  const selectedResource = catalog?.resources.find((item) => item.value === resourceValue);
  const actionValue = action || selectedResource?.actions[0]?.value || "";

  const selectPermission = (permission?: Permission) => {
    setSelectedPermission(permission);
    if (!permission) return;

    const [permissionResource, permissionAction] = permission.name.split(".");
    setResource(permissionResource ?? "");
    setAction(permissionAction ?? "");
  };

  const selectResource = (nextResource: string) => {
    const next = catalog?.resources.find((item) => item.value === nextResource);
    setResource(nextResource);
    setAction(next?.actions[0]?.value ?? "");
  };

  const savePermission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;

    const formData = new FormData(event.currentTarget);
    const input = selectedPermission
      ? {
        description: formData.get("description")?.toString() ?? "",
        status: formData.get("status")?.toString(),
      }
      : {
        resource: resourceValue,
        action: actionValue,
        description: formData.get("description")?.toString() ?? "",
        status: formData.get("status")?.toString(),
      };

    try {
      const permission = selectedPermission
        ? await updatePermission(selectedPermission.id, input, accessToken)
        : await createPermission(input, accessToken);

      setSelectedPermission(permission);
      await refreshPermissions();
      setOutcome({
        variant: "success",
        title: selectedPermission ? "Permission updated" : "Permission created",
        message: "The permission definition has been saved.",
      });
    } catch (requestError) {
      setOutcome({
        variant: "error",
        title: "Unable to save permission",
        message: requestError instanceof Error ? requestError.message : "Please try again.",
      });
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
      setOutcome({
        variant: "error",
        title: "Unable to delete permission",
        message: requestError instanceof Error ? requestError.message : "Please try again.",
      });
    }
  };

  if (isLoading || !session) return <main className="page-shell"><p>Checking your session...</p></main>;

  return (
    <AppShell eyebrow="Access control" subtitle="Define the individual actions the system can authorize." title="Permissions">
      <section className="access-workspace">
        <aside className="access-workspace__list">
          <div className="access-workspace__toolbar">
            <button onClick={() => selectPermission()} type="button">+ New permission</button>
          </div>
          {error && <p className="access-workspace__error">{error}</p>}
          <div className="access-workspace__items">
            {permissions.map((permission) => (
              <button
                className={selectedPermission?.id === permission.id ? "access-workspace__item is-selected" : "access-workspace__item"}
                key={permission.id}
                onClick={() => selectPermission(permission)}
                type="button"
              >
                <span className="access-workspace__meta"><span>{permission.function}</span><span>{permission.status}</span></span>
                <strong>{permission.name}</strong>
                <p>{permission.description || `${permission.function} / ${permission.action}`}</p>
              </button>
            ))}
            {!permissions.length && !error && <p className="access-workspace__empty">No permissions have been created yet.</p>}
          </div>
        </aside>

        <section className="access-workspace__editor">
          <div className="access-workspace__editor-header">
            <p>{selectedPermission ? "Edit permission" : "New permission"}</p>
            <h2>{selectedPermission?.name ?? "Create permission"}</h2>
          </div>
          <form key={selectedPermission?.id ?? "new"} onSubmit={(event) => void savePermission(event)}>
            <div className="field-grid">
              <label>
                Resource
                <select disabled={Boolean(selectedPermission)} onChange={(event) => selectResource(event.target.value)} value={resourceValue}>
                  {!catalog && <option>Loading resources...</option>}
                  {catalog?.resources.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label>
                Action
                <select disabled={Boolean(selectedPermission) || !selectedResource} onChange={(event) => setAction(event.target.value)} value={actionValue}>
                  {!selectedResource && <option>Choose a resource first</option>}
                  {selectedResource?.actions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label>
                Permission code
                <input readOnly value={selectedPermission?.name ?? (resourceValue && actionValue ? `${resourceValue}.${actionValue}` : "Choose a resource and action")} />
              </label>
              <label>
                Function
                <input readOnly value={selectedPermission?.function ?? selectedResource?.function ?? "Choose a resource"} />
              </label>
              <label>Status<select defaultValue={selectedPermission?.status ?? "ACTIVE"} name="status"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
            </div>
            <label className="feedback-modal__reason">Description<textarea defaultValue={selectedPermission?.description ?? ""} name="description" rows={4} /></label>
            <div className="access-workspace__actions">
              <button type="submit">{selectedPermission ? "Save changes" : "Create permission"}</button>
              {selectedPermission && <button className="delete-party-button" onClick={() => setPermissionToDelete(selectedPermission)} type="button">Delete permission</button>}
            </div>
          </form>
        </section>
      </section>
      {permissionToDelete && <ConfirmationModal cancelLabel="No, cancel" confirmLabel="Yes, delete" message="This action cannot be undone." onCancel={() => { setDeletionReason(""); setPermissionToDelete(undefined); }} onConfirm={() => void removePermission()} onReasonChange={setDeletionReason} reason={deletionReason} reasonLabel="Reason for deletion" title={`Delete ${permissionToDelete.name}?`} variant="danger" />}
      {outcome && <OutcomeModal actionLabel="Continue" message={outcome.message} onAction={() => setOutcome(undefined)} onClose={() => setOutcome(undefined)} title={outcome.title} variant={outcome.variant} />}
    </AppShell>
  );
}
