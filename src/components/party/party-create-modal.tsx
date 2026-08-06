"use client";

import "@/app/party-create.css";

import { FormEvent, useState } from "react";

import { createParty } from "@/lib/party-api";
import type { PartyType } from "@/types/party.types";

type PartyCreateModalProps = { accessToken: string; onClose: () => void; onCreated: (partyName: string) => void };

export function PartyCreateModal({ accessToken, onClose, onCreated }: PartyCreateModalProps) {
  const [type, setType] = useState<PartyType>("ORGANIZATION");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    setSaving(true);
    setError("");
    try { await createParty(type, values as Record<string, string> & { email: string }, accessToken); onCreated(type === "ORGANIZATION" ? values.legalName : `${values.givenName} ${values.familyName}`); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create party."); }
    finally { setSaving(false); }
  };

  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="new-party-title"><form className="party-create-modal" onSubmit={(event) => void submit(event)}><header><div><p className="eyebrow">New party</p><h2 id="new-party-title">Create party</h2></div><button className="modal-close" onClick={onClose} type="button" aria-label="Close">×</button></header><fieldset className="party-type-toggle"><legend>Party type</legend><button className={type === "ORGANIZATION" ? "is-selected" : ""} onClick={() => setType("ORGANIZATION")} type="button">Organization</button><button className={type === "INDIVIDUAL" ? "is-selected" : ""} onClick={() => setType("INDIVIDUAL")} type="button">Individual</button></fieldset>{type === "ORGANIZATION" ? <div className="modal-field-grid"><label>Legal name<input name="legalName" required placeholder="Acme Corporation" /></label><label>Trading name<input name="tradingName" placeholder="Optional" /></label><label>Organization type<input name="organizationType" placeholder="Optional" /></label></div> : <div className="modal-field-grid"><label>First name<input name="givenName" required /></label><label>Surname<input name="familyName" required /></label><label>Middle name<input name="middleName" /></label><label>Date of birth<input name="birthDate" type="date" /></label><label>Gender<input name="gender" /></label><label>Nationality<input name="nationality" /></label></div>}<div className="modal-field-grid"><label>Contact email<input name="email" required type="email" placeholder="access@company.com" /></label><label>Phone number<input name="phone" type="tel" /></label><label className="modal-field-full">Physical address<textarea name="address" rows={2} /></label></div><p className="modal-note">The contact email must be verified before the party becomes active.</p>{error && <p className="error">{error}</p>}<footer><button className="modal-cancel" onClick={onClose} type="button">Cancel</button><button disabled={saving} type="submit">{saving ? "Creating..." : "Create party"}</button></footer></form></div>;
}
