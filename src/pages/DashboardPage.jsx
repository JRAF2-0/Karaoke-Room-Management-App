import { useEffect, useMemo, useRef, useState } from 'react';
import RoomCard from '../components/RoomCard';
import { getRemainingSeconds } from '../utils/time';

function BookingModal({ open, room, customerName, duration, onClose, onCustomerNameChange, onDurationChange, onConfirm }) {
  if (!open || !room) return null;

  const totalCost = Number(duration) * Number(room.price || 120);

  return (
    <div className="modal-overlay active" id="booking-modal" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title" id="modal-title">
            Book {room.name}
          </h2>
          <button className="modal__close" type="button" id="close-modal" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <form id="booking-form" onSubmit={(event) => event.preventDefault()}>
            <div className="form-group">
              <label htmlFor="customer-name" className="form-label">
                Customer Name
              </label>
              <input
                id="customer-name"
                type="text"
                className="form-input"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(event) => onCustomerNameChange(event.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                Duration (Hours)
              </label>
              <select
                id="duration"
                className="form-select"
                value={duration}
                onChange={(event) => onDurationChange(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? 'hour' : 'hours'}
                  </option>
                ))}
              </select>
            </div>

            <div className="cost-summary">
              <div className="cost-row">
                <span className="cost-label">Rate per hour:</span>
                <span className="cost-value" id="booking-rate-per-hour">
                  PHP {room.price}
                </span>
              </div>
              <div className="cost-row">
                <span className="cost-label">Duration:</span>
                <span className="cost-value" id="duration-display">
                  {duration} {duration === 1 ? 'hour' : 'hours'}
                </span>
              </div>
              <div className="cost-row total">
                <span className="cost-label">Total Cost:</span>
                <span className="cost-value" id="total-cost">
                  PHP {totalCost}
                </span>
              </div>
            </div>
          </form>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn-modal btn-cancel" id="cancel-booking" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-modal btn-confirm" id="confirm-booking" onClick={onConfirm}>
            Book Room
          </button>
        </div>
      </div>
    </div>
  );
}

function ExtendModal({ open, room, duration, onClose, onDurationChange, onConfirm }) {
  if (!open || !room) return null;

  const totalCost = Number(duration) * Number(room.price || 120);

  return (
    <div className="modal-overlay active" id="extend-modal" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title" id="extend-modal-title">
            Extend {room.name}
          </h2>
          <button className="modal__close" type="button" id="close-extend-modal" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <form id="extend-form" onSubmit={(event) => event.preventDefault()}>
            <div className="form-group">
              <label htmlFor="extend-duration" className="form-label">
                Add Additional Time
              </label>
              <select
                id="extend-duration"
                className="form-select"
                value={duration}
                onChange={(event) => onDurationChange(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((value) => (
                  <option key={value} value={value}>
                    {value} {value === 1 ? 'hour' : 'hours'}
                  </option>
                ))}
              </select>
            </div>

            <div className="cost-summary">
              <div className="cost-row">
                <span className="cost-label">Rate per hour:</span>
                <span className="cost-value" id="extend-rate-per-hour">
                  PHP {room.price}
                </span>
              </div>
              <div className="cost-row">
                <span className="cost-label">Additional time:</span>
                <span className="cost-value" id="extend-duration-display">
                  {duration} {duration === 1 ? 'hour' : 'hours'}
                </span>
              </div>
              <div className="cost-row total">
                <span className="cost-label">Additional Cost:</span>
                <span className="cost-value" id="extend-total-cost">
                  PHP {totalCost}
                </span>
              </div>
            </div>
          </form>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn-modal btn-cancel" id="cancel-extend" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-modal btn-confirm" id="confirm-extend" onClick={onConfirm}>
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ open, data, onClose }) {
  if (!open || !data) return null;

  return (
    <div className="success-modal-overlay active" id="success-modal" onClick={onClose}>
      <div className="success-modal" onClick={(event) => event.stopPropagation()}>
        <div className="success-modal__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="success-modal__title">Booking Confirmed!</h2>
        <p className="success-modal__message">
          <span className="success-modal__room-name" id="success-room-name">
            {data.roomName}
          </span>{' '}
          has been successfully booked.
        </p>
        <p className="success-modal__details" id="success-booking-details">
          Customer: <span id="success-customer-name">{data.customerName}</span> | Duration:{' '}
          <span id="success-duration">
            {data.duration} {data.duration === 1 ? 'hour' : 'hours'}
          </span>
        </p>
        <button className="btn btn-primary" id="close-success-modal" style={{ marginTop: '1.5rem' }} onClick={onClose} type="button">
          Got it!
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage({
  rooms,
  activeSessions,
  onBookRoom,
  onReleaseRoom,
  onExtendRoom,
  onRefresh,
  notify,
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [bookingRoomId, setBookingRoomId] = useState(null);
  const [bookingCustomer, setBookingCustomer] = useState('');
  const [bookingDuration, setBookingDuration] = useState(1);
  const [extendRoomId, setExtendRoomId] = useState(null);
  const [extendDuration, setExtendDuration] = useState(1);
  const [successData, setSuccessData] = useState(null);
  const notifiedKeysRef = useRef(new Set());
  const releasingRoomsRef = useRef(new Set());

  const roomMap = useMemo(() => {
    const map = new Map();

    rooms.forEach((room) => {
      map.set(room.id, room);
    });

    return map;
  }, [rooms]);

  const activeSessionMap = useMemo(() => {
    const map = new Map();

    activeSessions.forEach((session) => {
      map.set(session.room_id, session);
    });

    return map;
  }, [activeSessions]);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => a.id - b.id);
  }, [rooms]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const activeRoomIds = new Set(activeSessions.map((session) => session.room_id));

    Array.from(notifiedKeysRef.current).forEach((key) => {
      const roomId = Number(String(key).split('-')[0]);
      if (!activeRoomIds.has(roomId)) {
        notifiedKeysRef.current.delete(key);
      }
    });
  }, [activeSessions]);

  useEffect(() => {
    activeSessions.forEach((session) => {
      const roomId = Number(session.room_id);
      const remaining = getRemainingSeconds(session, nowMs);
      const roomName = roomMap.get(roomId)?.name || `Room ${roomId}`;

      if (remaining <= 0 && !releasingRoomsRef.current.has(roomId)) {
        releasingRoomsRef.current.add(roomId);

        onReleaseRoom(roomId)
          .then(() => {
            notify(`${roomName} session has ended automatically.`, 'warning');
            return onRefresh();
          })
          .catch((error) => {
            notify(error.message || 'Failed to auto-release room.', 'error');
          })
          .finally(() => {
            releasingRoomsRef.current.delete(roomId);
          });

        return;
      }

      if (remaining === 300 && !notifiedKeysRef.current.has(`${roomId}-5m`)) {
        notifiedKeysRef.current.add(`${roomId}-5m`);
        notify(`${roomName} (${session.customer_name}) has only 5 minutes remaining!`, 'warning');

        setTimeout(() => {
          if (window.confirm(`${roomName} time is running out.\n\nDo you want to extend this session now?`)) {
            setExtendRoomId(roomId);
            setExtendDuration(1);
          }
        }, 250);
      }

      if (remaining === 60 && !notifiedKeysRef.current.has(`${roomId}-1m`)) {
        notifiedKeysRef.current.add(`${roomId}-1m`);
        notify(`${roomName} (${session.customer_name}) has only 1 minute remaining!`, 'warning');
      }
    });
  }, [activeSessions, nowMs, notify, onRefresh, onReleaseRoom, roomMap]);

  const bookingRoom = bookingRoomId ? roomMap.get(bookingRoomId) : null;
  const extendRoom = extendRoomId ? roomMap.get(extendRoomId) : null;

  const openBooking = (roomId) => {
    setBookingRoomId(roomId);
    setBookingCustomer('');
    setBookingDuration(1);
  };

  const closeBooking = () => {
    setBookingRoomId(null);
  };

  const openExtend = (roomId) => {
    setExtendRoomId(roomId);
    setExtendDuration(1);
  };

  const closeExtend = () => {
    setExtendRoomId(null);
  };

  const closeSuccess = () => {
    setSuccessData(null);
  };

  const handleStopRoom = async (roomId) => {
    const room = roomMap.get(roomId);
    const roomLabel = room?.name || `Room ${roomId}`;

    if (!window.confirm(`Are you sure you want to stop the session for ${roomLabel}?`)) {
      return;
    }

    try {
      await onReleaseRoom(roomId);
      await onRefresh();
      notify(`${roomLabel} session has been stopped.`, 'success');
    } catch (error) {
      notify(error.message || 'Failed to stop the session.', 'error');
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingRoom) return;

    if (!bookingCustomer.trim()) {
      notify('Please enter customer name.', 'error');
      return;
    }

    try {
      await onBookRoom({
        roomId: bookingRoom.id,
        customerName: bookingCustomer,
        durationHours: bookingDuration,
      });
      await onRefresh();

      setSuccessData({
        roomName: bookingRoom.name,
        customerName: bookingCustomer.trim(),
        duration: bookingDuration,
      });
      closeBooking();
      notify(`${bookingRoom.name} booked for ${bookingCustomer.trim()} (${bookingDuration}h).`, 'success');
    } catch (error) {
      notify(error.message || 'Failed to book room.', 'error');
    }
  };

  const handleConfirmExtend = async () => {
    if (!extendRoom) return;

    try {
      await onExtendRoom({ roomId: extendRoom.id, additionalHours: extendDuration });
      await onRefresh();

      notifiedKeysRef.current.delete(`${extendRoom.id}-5m`);
      notifiedKeysRef.current.delete(`${extendRoom.id}-1m`);

      closeExtend();
      notify(`${extendRoom.name} extended by ${extendDuration} ${extendDuration === 1 ? 'hour' : 'hours'}.`, 'success');
    } catch (error) {
      notify(error.message || 'Failed to extend session.', 'error');
    }
  };

  return (
    <>
      <div className="room-grid">
        {sortedRooms.map((room) => {
          const session = activeSessionMap.get(room.id) || null;
          const remainingSeconds = session ? getRemainingSeconds(session, nowMs) : 0;

          return (
            <RoomCard
              key={room.id}
              room={room}
              session={session}
              remainingSeconds={remainingSeconds}
              onBook={openBooking}
              onStop={handleStopRoom}
            />
          );
        })}
      </div>

      <BookingModal
        open={Boolean(bookingRoom)}
        room={bookingRoom}
        customerName={bookingCustomer}
        duration={bookingDuration}
        onClose={closeBooking}
        onCustomerNameChange={setBookingCustomer}
        onDurationChange={setBookingDuration}
        onConfirm={handleConfirmBooking}
      />

      <ExtendModal
        open={Boolean(extendRoom)}
        room={extendRoom}
        duration={extendDuration}
        onClose={closeExtend}
        onDurationChange={setExtendDuration}
        onConfirm={handleConfirmExtend}
      />

      <SuccessModal open={Boolean(successData)} data={successData} onClose={closeSuccess} />
    </>
  );
}