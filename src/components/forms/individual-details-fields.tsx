export function IndividualDetailsFields() {
  return (
    <fieldset className="registration-section">
      <div className="registration-section-heading">
        <legend>Personal details</legend>
        <p>These details create the Individual Party for this administrator account.</p>
      </div>
      <div className="registration-field-grid">
        <label>
          <span>First name <b aria-hidden="true">*</b></span>
          <input name="givenName" required maxLength={120} autoComplete="given-name" />
        </label>
        <label>
          <span>Middle name <em>Optional</em></span>
          <input name="middleName" maxLength={120} autoComplete="additional-name" />
        </label>
        <label>
          <span>Surname <b aria-hidden="true">*</b></span>
          <input name="familyName" required maxLength={120} autoComplete="family-name" />
        </label>
        <label>
          <span>Date of birth <em>Optional</em></span>
          <input name="birthDate" type="date" />
        </label>
        <label>
          <span>Gender <em>Optional</em></span>
          <input name="gender" maxLength={50} />
        </label>
        <label>
          <span>Nationality <em>Optional</em></span>
          <input name="nationality" maxLength={100} />
        </label>
      </div>
    </fieldset>
  );
}
