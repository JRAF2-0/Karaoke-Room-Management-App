import { useMemo, useState } from 'react';

function RoomModal({
  open,
  title,
  confirmLabel,
  name,
  price,
  onClose,
  onNameChange,
  onPriceChange,
  onConfirm,
  inputNameId,
  inputPriceId,
  closeButtonId,
  cancelButtonId,
  confirmButtonId,
  modalId,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay active" id={modalId} onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" type="button" id={closeButtonId} onClick={onClose} aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <form onSubmit={(event) => event.preventDefault()}>
            <div className="form-group">
              <label htmlFor={inputNameId} className="form-label">
                Room Name <span className="form-required">*</span>
              </label>
              <input
                type="text"
                id={inputNameId}
                className="form-input"
                placeholder="e.g., VIP Room"
                minLength={3}
                maxLength={50}
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                autoFocus
              />
              <small className="form-hint">3-50 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor={inputPriceId} className="form-label">
                Price per Hour <span className="form-required">*</span>
              </label>
              <div className="form-input-group">
                <span className="form-currency">PHP</span>
                <input
                  type="number"
                  id={inputPriceId}
                  className="form-input"
                  min={1}
                  max={10000}
                  value={price}
                  onChange={(event) => onPriceChange(event.target.value)}
                />
              </div>
              <small className="form-hint">1 - 10,000 PHP</small>
            </div>
          </form>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn-modal btn-cancel" id={cancelButtonId} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-modal btn-confirm" id={confirmButtonId} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage({ rooms, onAddRoom, onUpdateRoom, onDeleteRoom, onRefresh, notify }) {
  const sortedRooms = useMemo(() => [...rooms].sort((a, b) => a.id - b.id), [rooms]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [roomName, setRoomName] = useState('');
  const [roomPrice, setRoomPrice] = useState('120');
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setRoomName('');
    setRoomPrice('120');
    setIsAddOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
  };

  const openEditModal = (room) => {
    setEditingRoomId(room.id);
    setRoomName(room.name);
    setRoomPrice(String(room.price));
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingRoomId(null);
  };

  const handleAdd = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await onAddRoom({ name: roomName, pricePerHour: Number(roomPrice) });
      await onRefresh();
      closeAddModal();
      notify(`${roomName.trim() || 'Room'} added successfully!`, 'success');
    } catch (error) {
      notify(error.message || 'Failed to add room.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async () => {
    if (isSaving || !editingRoomId) return;
    setIsSaving(true);

    try {
      await onUpdateRoom({ roomId: editingRoomId, name: roomName, pricePerHour: Number(roomPrice) });
      await onRefresh();
      closeEditModal();
      notify(`${roomName.trim() || 'Room'} updated successfully!`, 'success');
    } catch (error) {
      notify(error.message || 'Failed to update room.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Are you sure you want to delete ${room.name}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await onDeleteRoom(room.id);
      await onRefresh();
      notify(`${room.name} deleted successfully!`, 'success');
    } catch (error) {
      notify(error.message || 'Failed to delete room.', 'error');
    }
  };

  return (
    <>
      <div className="admin-container">
        <div className="admin-header">
          <h2 className="admin-header__title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Admin Settings
          </h2>

          <button className="btn-add-room" id="add-room-btn" type="button" onClick={openAddModal}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Room
          </button>
        </div>

        <div className="room-list" id="admin-room-list">
          {sortedRooms.length === 0 && (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No rooms yet. Click "Add Room" to create one.</p>
          )}

          {sortedRooms.map((room) => (
            <div key={room.id} className="room-item" data-room-id={room.id}>
              <div className="room-item__info">
                <div className="room-item__name">{room.name}</div>
                <div className="room-item__price">PHP {room.price}/hour</div>
              </div>

              <div className="room-item__actions">
                <button className="btn-icon-only btn-edit" data-room={room.id} type="button" title="Edit Room" onClick={() => openEditModal(room)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                <button className="btn-icon-only btn-delete" data-room={room.id} type="button" title="Delete Room" onClick={() => handleDelete(room)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RoomModal
        open={isAddOpen}
        title="Add New Room"
        confirmLabel="Add Room"
        name={roomName}
        price={roomPrice}
        onClose={closeAddModal}
        onNameChange={setRoomName}
        onPriceChange={setRoomPrice}
        onConfirm={handleAdd}
        inputNameId="add-room-name"
        inputPriceId="add-room-price"
        closeButtonId="close-add-modal"
        cancelButtonId="cancel-add"
        confirmButtonId="confirm-add"
        modalId="add-room-modal"
      />

      <RoomModal
        open={isEditOpen}
        title="Edit Room"
        confirmLabel="Save Changes"
        name={roomName}
        price={roomPrice}
        onClose={closeEditModal}
        onNameChange={setRoomName}
        onPriceChange={setRoomPrice}
        onConfirm={handleEdit}
        inputNameId="edit-room-name"
        inputPriceId="edit-room-price"
        closeButtonId="close-edit-modal"
        cancelButtonId="cancel-edit"
        confirmButtonId="confirm-edit"
        modalId="edit-room-modal"
      />
    </>
  );
}