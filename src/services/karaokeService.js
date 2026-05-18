import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { formatSessionDate } from '../utils/time';

function ensureClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
    );
  }

  return supabase;
}

function toServiceError(error, fallbackMessage) {
  if (!error) {
    return new Error(fallbackMessage);
  }

  const message = error.message || fallbackMessage;
  return new Error(message);
}

function mapRoomRow(room) {
  return {
    id: Number(room.id),
    name: room.name,
    price: Number(room.price_per_hour),
  };
}

export async function fetchRooms() {
  const client = ensureClient();

  const { data, error } = await client
    .from('rooms')
    .select('id, name, price_per_hour')
    .order('id', { ascending: true });

  if (error) {
    throw toServiceError(error, 'Failed to load rooms.');
  }

  return (data || []).map(mapRoomRow);
}

export async function fetchActiveSessions() {
  const client = ensureClient();

  const { data, error } = await client
    .from('sessions')
    .select('id, room_id, customer_name, start_time, duration_seconds, status')
    .eq('status', 'active')
    .order('room_id', { ascending: true });

  if (error) {
    throw toServiceError(error, 'Failed to load active sessions.');
  }

  return (data || []).map((session) => ({
    id: Number(session.id),
    room_id: Number(session.room_id),
    customer_name: session.customer_name,
    start_time: Number(session.start_time),
    duration_seconds: Number(session.duration_seconds),
    status: session.status,
  }));
}

export async function fetchDashboardData() {
  const [rooms, activeSessions] = await Promise.all([fetchRooms(), fetchActiveSessions()]);
  return { rooms, activeSessions };
}

export async function bookRoom({ roomId, customerName, durationHours }) {
  const client = ensureClient();

  const payload = {
    room_id: Number(roomId),
    customer_name: String(customerName).trim(),
    start_time: Date.now(),
    duration_seconds: Number(durationHours) * 3600,
    status: 'active',
  };

  const { error } = await client.from('sessions').insert([payload]);

  if (error) {
    if (error.code === '23505') {
      throw new Error('Room is already occupied.');
    }

    throw toServiceError(error, 'Failed to book room.');
  }

  return true;
}

export async function releaseRoom(roomId) {
  const client = ensureClient();

  const { error } = await client
    .from('sessions')
    .update({ status: 'ended', actual_end_time: Date.now() })
    .eq('room_id', Number(roomId))
    .eq('status', 'active');

  if (error) {
    throw toServiceError(error, 'Failed to release room.');
  }

  return true;
}

export async function extendRoom(roomId, additionalHours) {
  const client = ensureClient();

  const { data: session, error: sessionError } = await client
    .from('sessions')
    .select('id, duration_seconds')
    .eq('room_id', Number(roomId))
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    throw toServiceError(sessionError, 'Failed to find active session.');
  }

  if (!session) {
    throw new Error('No active session found for this room.');
  }

  const additionalSeconds = Number(additionalHours) * 3600;

  const { error } = await client
    .from('sessions')
    .update({ duration_seconds: Number(session.duration_seconds) + additionalSeconds })
    .eq('id', Number(session.id))
    .eq('status', 'active');

  if (error) {
    throw toServiceError(error, 'Failed to extend session.');
  }

  return true;
}

export async function resetAllRooms() {
  const client = ensureClient();

  const { error } = await client
    .from('sessions')
    .update({ status: 'ended', actual_end_time: Date.now() })
    .eq('status', 'active');

  if (error) {
    throw toServiceError(error, 'Failed to reset rooms.');
  }

  return true;
}

export async function fetchHistory({ page = 1, limit = 20, status = 'all' }) {
  const client = ensureClient();

  const safePage = Math.max(1, Number(page));
  const safeLimit = Math.max(1, Math.min(100, Number(limit)));
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = client
    .from('sessions')
    .select(
      'id, room_id, customer_name, start_time, duration_seconds, status, created_at, rooms(name, price_per_hour)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status === 'active' || status === 'ended') {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw toServiceError(error, 'Failed to load booking history.');
  }

  const rows = (data || []).map((row) => {
    const rate = Number(row.rooms?.price_per_hour || 120);
    const hours = Number(row.duration_seconds) / 3600;

    return {
      id: Number(row.id),
      room_name: row.rooms?.name || `Room ${row.room_id}`,
      customer_name: row.customer_name,
      start_time: Number(row.start_time),
      duration_seconds: Number(row.duration_seconds),
      duration_hours: hours,
      status: row.status,
      total_cost: Math.round(hours * rate),
      date_display: formatSessionDate(row.created_at),
    };
  });

  const total = Number(count || 0);

  return {
    data: rows,
    total,
    page: safePage,
    limit: safeLimit,
    total_pages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

export async function fetchHistorySummary() {
  const client = ensureClient();

  const { data, error } = await client.rpc('get_history_summary');

  if (!error && Array.isArray(data) && data[0]) {
    return {
      totalBookings: Number(data[0].total_bookings || 0),
      activeBookings: Number(data[0].active_bookings || 0),
      totalRevenue: Number(data[0].total_revenue || 0),
    };
  }

  const [totalResult, activeResult] = await Promise.all([
    client.from('sessions').select('id', { count: 'exact', head: true }),
    client.from('sessions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  if (totalResult.error) {
    throw toServiceError(totalResult.error, 'Failed to load booking summary.');
  }

  if (activeResult.error) {
    throw toServiceError(activeResult.error, 'Failed to load booking summary.');
  }

  return {
    totalBookings: Number(totalResult.count || 0),
    activeBookings: Number(activeResult.count || 0),
    totalRevenue: 0,
  };
}

function validateRoomData(name, pricePerHour) {
  const errors = [];
  const trimmedName = String(name || '').trim();
  const parsedPrice = Number(pricePerHour);

  if (trimmedName.length < 3 || trimmedName.length > 50) {
    errors.push('Room name must be 3 to 50 characters.');
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice < 1 || parsedPrice > 10000) {
    errors.push('Price must be between 1 and 10,000.');
  }

  return errors;
}

export async function addRoom({ name, pricePerHour }) {
  const client = ensureClient();
  const errors = validateRoomData(name, pricePerHour);

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const { data, error } = await client
    .from('rooms')
    .insert([{ name: String(name).trim(), price_per_hour: Number(pricePerHour) }])
    .select('id')
    .limit(1)
    .maybeSingle();

  if (error) {
    throw toServiceError(error, 'Failed to add room.');
  }

  return { id: Number(data?.id) };
}

export async function updateRoom({ roomId, name, pricePerHour }) {
  const client = ensureClient();
  const errors = validateRoomData(name, pricePerHour);

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const { error } = await client
    .from('rooms')
    .update({ name: String(name).trim(), price_per_hour: Number(pricePerHour) })
    .eq('id', Number(roomId));

  if (error) {
    throw toServiceError(error, 'Failed to update room.');
  }

  return true;
}

export async function deleteRoom(roomId) {
  const client = ensureClient();

  const { data: activeSession, error: activeSessionError } = await client
    .from('sessions')
    .select('id')
    .eq('room_id', Number(roomId))
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (activeSessionError) {
    throw toServiceError(activeSessionError, 'Failed to check room status.');
  }

  if (activeSession) {
    throw new Error('Cannot delete an occupied room. Release it first.');
  }

  const { error } = await client.from('rooms').delete().eq('id', Number(roomId));

  if (error) {
    throw toServiceError(error, 'Failed to delete room.');
  }

  return true;
}