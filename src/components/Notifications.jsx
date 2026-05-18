const COLORS = {
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
};

export default function Notifications({ items }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 400,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="alert"
          style={{
            padding: '1rem 1.5rem',
            background: COLORS[item.type] || COLORS.success,
            color: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}