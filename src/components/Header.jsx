export default function Header({ occupiedCount, totalRooms, onReset }) {
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <div className="header__content">
          <h1 className="header__title">Karaoke Room Management</h1>
          <p className="header__subtitle">
            <span id="occupied-count">{occupiedCount}</span> of <span id="total-rooms">{totalRooms}</span> rooms occupied
          </p>
        </div>
      </div>

      <div className="header__right">
        <button className="btn btn-reset" id="reset-btn" type="button" onClick={onReset}>
          <span className="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </span>
          Reset All Data
        </button>
      </div>
    </header>
  );
}