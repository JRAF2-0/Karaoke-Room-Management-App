import { useCallback, useEffect, useMemo, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Notifications from './components/Notifications';
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
            notify={notify}
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
            notify={notify}
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
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;

    setNotifications((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

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

  const handleResetAll = useCallback(async () => {
    if (!window.confirm('Are you sure you want to reset all room data? This action cannot be undone.')) {
      return;
    }

    try {
      await resetAllRooms();
      await refreshData(false);
      notify('All rooms have been reset successfully!', 'success');
    } catch (error) {
      notify(error.message || 'Failed to reset rooms.', 'error');
    }
  }, [notify, refreshData]);

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
            />
          )}
        </div>
      </div>

      <Notifications items={notifications} />
    </HashRouter>
  );
}