const MANILA_LOCALE = 'en-PH';
const MANILA_TIME_ZONE = 'Asia/Manila';

export function formatSecondsToClock(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDurationFromSeconds(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatSessionDate(timestampOrDateString) {
  const date = new Date(timestampOrDateString);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat(MANILA_LOCALE, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: MANILA_TIME_ZONE,
  }).format(date);
}

export function getRemainingSeconds(session, nowMs = Date.now()) {
  const elapsed = Math.floor((nowMs - Number(session.start_time)) / 1000);
  return Math.max(0, Number(session.duration_seconds) - elapsed);
}

export function getSessionEndTimeMs(session) {
  return Number(session.start_time) + Number(session.duration_seconds) * 1000;
}