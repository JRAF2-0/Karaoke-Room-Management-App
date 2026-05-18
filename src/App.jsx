import { useCallback, useEffect, useMemo, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import AlertModal from './components/AlertModal';
import ConfirmDialog from './components/ConfirmDialog';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  addRoom,
  bookRoom,
  deleteRoom,
  extendRoom,
  fetchDashboardData,
  releaseRoom,
  resetAllRooms,
  updateRoom,
} from './services/karaokeService';

function AppContent({
  rooms,
  activeSessions,
  onBookRoom,
  onReleaseRoom,
  onExtendRoom,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onRefresh,
  notify,
  showAlert,
  confirm,
}) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardPage
            rooms={rooms}
            activeSessions={activeSessions}
            onBookRoom={onBookRoom}
            onReleaseRoom={onReleaseRoom}
            onExtendRoom={onExtendRoom}
            onRefresh={onRefresh}
            showAlert={showAlert}
            confirm={confirm}
          />
        }
      />

      <Route path="/history" element={<HistoryPage notify={notify} />} />

      <Route
        path="/admin"
        element={
          <AdminPage
            rooms={rooms}
            onAddRoom={onAddRoom}
            onUpdateRoom={onUpdateRoom}
            onDeleteRoom={onDeleteRoom}
            onRefresh={onRefresh}
            notify={notify}
            confirm={confirm}
          />
        }
      />

      <Route
        path="*"
        element={
          <DashboardPage
            rooms={rooms}
            activeSessions={activeSessions}
            onBookRoom={onBookRoom}
            onReleaseRoom={onReleaseRoom}
            onExtendRoom={onExtendRoom}
            onRefresh={onRefresh}
            showAlert={showAlert}
            confirm={confirm}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [alertState, setAlertState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const showAlert = useCallback((options) => {
    const { type = 'success', title, message, details } = options || {};
    setAlertState({ type, title, message, details });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  const notify = useCallback(
    (message, type = 'success') => {
      showAlert({ type, message });
    },
    [showAlert],
  );

  const confirm = useCallback((options) => {
    const {
      title,
      message,
      confirmLabel,
      cancelLabel,
      destructive = false,
      onConfirm,
    } = options || {};

    setConfirmState({
      title,
      message,
      confirmLabel,
      cancelLabel,
      destructive,
      onConfirm,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  const handleConfirm = useCallback(() => {
    const callback = confirmState?.onConfirm;
    setConfirmState(null);
    if (typeof callback === 'function') {
      callback();
    }
  }, [confirmState]);

  const refreshData = useCallback(
    async (showLoader = false) => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      if (showLoader) {
        setIsLoading(true);
      }

      try {
        const { rooms: roomsData, activeSessions: sessionsData } = await fetchDashboardData();
        setRooms(roomsData);
        setActiveSessions(sessionsData);
        setLoadError('');
      } catch (error) {
        setLoadError(error.message || 'Failed to load data from Supabase.');
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    refreshData(true);
  }, [refreshData]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }

    const channel = supabase
      .channel('karaoke-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        refreshData(false);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
        refreshData(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  const occupiedCount = activeSessions.length;
  const totalRooms = rooms.length;

  const statusMessage = useMemo(() => {
    if (!isSupabaseConfigured) {
      return 'Supabase env keys are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.';
    }

    if (loadError) {
      return loadError;
    }

    return '';
  }, [loadError]);

  const handleResetAll = useCallback(() => {
    confirm({
      title: 'Reset all rooms?',
      message: 'This will clear all bookings and active sessions. This action cannot be undone.',
      confirmLabel: 'Reset all',
      destructive: true,
      onConfirm: async () => {
        try {
          await resetAllRooms();
          await refreshData(false);
          showAlert({
            type: 'success',
            title: 'Rooms reset',
            message: 'All rooms have been reset successfully.',
          });
        } catch (error) {
          showAlert({
            type: 'error',
            message: error.message || 'Failed to reset rooms.',
          });
        }
      },
    });
  }, [confirm, refreshData, showAlert]);

  if (isLoading && isSupabaseConfigured) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <p>Loading app data...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="page-wrapper">
        <div className="container">
          <Header occupiedCount={occupiedCount} totalRooms={totalRooms} onReset={handleResetAll} />
          <Navigation />

          {statusMessage && (
            <div
              style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                padding: '1rem',
                borderRadius: '0.5rem',
                background: '#fff3f3',
                color: '#b42318',
                border: '1px solid #f4c7c7',
              }}
            >
              {statusMessage}
            </div>
          )}

          {isSupabaseConfigured && (
            <AppContent
              rooms={rooms}
              activeSessions={activeSessions}
              onBookRoom={bookRoom}
              onReleaseRoom={releaseRoom}
              onExtendRoom={extendRoom}
              onAddRoom={addRoom}
              onUpdateRoom={updateRoom}
              onDeleteRoom={deleteRoom}
              onRefresh={refreshData}
              notify={notify}
              showAlert={showAlert}
              confirm={confirm}
            />
          )}
        </div>
      </div>

      <AlertModal
        open={Boolean(alertState)}
        type={alertState?.type}
        title={alertState?.title}
        message={alertState?.message}
        details={alertState?.details}
        onClose={closeAlert}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        cancelLabel={confirmState?.cancelLabel}
        destructive={confirmState?.destructive}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </HashRouter>
  );
}
