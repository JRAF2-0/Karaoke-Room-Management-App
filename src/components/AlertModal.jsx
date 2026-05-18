const TYPE_CONFIG = {
  success: {
    iconGradient: 'linear-gradient(135deg, #4CAF50, #45a049)',
    accent: '#4CAF50',
    defaultTitle: 'Success',
    icon: (
      <polyline points="20 6 9 17 4 12" />
    ),
  },
  error: {
    iconGradient: 'linear-gradient(135deg, #f44336, #d32f2f)',
    accent: '#f44336',
    defaultTitle: 'Something went wrong',
    icon: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
  },
  warning: {
    iconGradient: 'linear-gradient(135deg, #ff9800, #f57c00)',
    accent: '#ff9800',
    defaultTitle: 'Heads up',
    icon: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
};

export default function AlertModal({ open, type = 'success', title, message, details, onClose }) {
  if (!open) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.success;
  const heading = title || config.defaultTitle;

  return (
    <div className="success-modal-overlay active" onClick={onClose}>
      <div className="success-modal" onClick={(event) => event.stopPropagation()}>
        <div className="success-modal__icon" style={{ background: config.iconGradient }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {config.icon}
          </svg>
        </div>
        <h2 className="success-modal__title">{heading}</h2>
        <p className="success-modal__message" style={{ '--accent-color': config.accent }}>
          {message}
        </p>
        {details && (
          <p className="success-modal__details">{details}</p>
        )}
        <button
          className="btn btn-primary"
          style={{ marginTop: '1.5rem' }}
          onClick={onClose}
          type="button"
          autoFocus
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
