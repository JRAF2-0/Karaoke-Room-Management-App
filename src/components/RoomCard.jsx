import { formatSecondsToClock } from '../utils/time';

export default function RoomCard({ room, session, remainingSeconds, onBook, onStop }) {
  const isOccupied = Boolean(session && remainingSeconds > 0);
  const timerClassName =
    remainingSeconds <= 300 ? 'timer-display danger' : remainingSeconds <= 600 ? 'timer-display warning' : 'timer-display';

  return (
    <div className={`room-card${isOccupied ? ' occupied fade-in' : ' fade-in'}`} id={`room-${room.id}`} data-room-number={room.id}>
      <div className="room-card__header">
        <h3 className="room-card__title">{room.name || `Room ${room.id}`}</h3>
        <span className={`room-card__status ${isOccupied ? 'room-card__status--occupied' : 'room-card__status--vacant'}`}>
          {isOccupied ? 'Occupied' : 'Vacant'}
        </span>
      </div>

      {!isOccupied && (
        <div className="room-card__body room-card__body--vacant" style={{ display: 'flex' }}>
          <div className="room-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="room-card__availability">Available</p>
          <p className="room-card__price">PHP {room.price}/hour</p>
        </div>
      )}

      {isOccupied && (
        <div className="room-card__body room-card__body--occupied" style={{ display: 'flex' }}>
          <div className="room-card__occupied-info">
            <div className="customer-info">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="customer-name">{session.customer_name || 'Guest'}</span>
            </div>
            <div className={timerClassName}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="timer-time">{formatSecondsToClock(remainingSeconds)}</span>
            </div>
            <p className="room-card__price">PHP {room.price}/hour</p>
          </div>
        </div>
      )}

      <div className="room-card__footer">
        {isOccupied ? (
          <button className="btn btn-stop btn-book" data-room={room.id} type="button" onClick={() => onStop(room.id)}>
            <span className="btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </span>
            Stop Session
          </button>
        ) : (
          <button className="btn btn-primary btn-book" data-room={room.id} type="button" onClick={() => onBook(room.id)}>
            <span className="btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Book Room
          </button>
        )}
      </div>
    </div>
  );
}
