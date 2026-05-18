export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay active" onClick={onCancel}>
      <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" type="button" onClick={onCancel} aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
            {message}
          </p>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn-modal btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-modal btn-confirm"
            onClick={onConfirm}
            autoFocus
            style={destructive ? { background: '#e53935', color: '#fff' } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
