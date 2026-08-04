"use client";

type OutcomeModalProps = {
  variant: "success" | "error";
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onClose: () => void;
};

export function OutcomeModal({
  variant,
  title,
  message,
  actionLabel,
  onAction,
  onClose,
}: OutcomeModalProps) {
  const isSuccess = variant === "success";

  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-labelledby="outcome-title" aria-modal="true" className={`feedback-modal feedback-modal--${variant}`} role="dialog">
        <button aria-label="Close dialog" className="modal-close" onClick={onClose} type="button">×</button>
        <div aria-hidden="true" className="feedback-modal__icon">
          {isSuccess ? "✓" : "!"}
        </div>
        <h1 id="outcome-title">{title}</h1>
        <p>{message}</p>
        <button className="feedback-modal__primary-action" onClick={onAction} type="button">
          {actionLabel}
        </button>
      </section>
    </div>
  );
}
