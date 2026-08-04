"use client";

type ConfirmationModalProps = {
  variant: "danger" | "warning";
  title: string;
  message: string;
  reasonLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  variant,
  title,
  message,
  reasonLabel,
  confirmLabel,
  cancelLabel,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-labelledby="confirmation-title" aria-modal="true" className={`feedback-modal feedback-modal--${variant}`} role="dialog">
        <button aria-label="Close dialog" className="modal-close" onClick={onCancel} type="button">&times;</button>
        <div aria-hidden="true" className="feedback-modal__icon">!</div>
        <h1 id="confirmation-title">{title}</h1>
        <p>{message}</p>
        <label className="feedback-modal__reason">
          {reasonLabel}
          <textarea maxLength={1000} onChange={(event) => onReasonChange(event.target.value)} required rows={3} value={reason} />
        </label>
        <div className="feedback-modal__actions">
          <button className="feedback-modal__secondary-action" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button className={variant === "danger" ? "feedback-modal__danger-action" : "feedback-modal__primary-action"} disabled={!reason.trim()} onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
