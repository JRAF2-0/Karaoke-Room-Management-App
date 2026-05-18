import { useCallback, useEffect, useState } from 'react';
import { fetchHistory, fetchHistorySummary } from '../services/karaokeService';
import { formatDurationFromSeconds } from '../utils/time';

const LIMIT = 20;

export default function HistoryPage({ notify }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStatus, setCurrentStatus] = useState('all');

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
  });

  const loadSummary = useCallback(async () => {
    try {
      const summaryData = await fetchHistorySummary();
      setSummary(summaryData);
    } catch (error) {
      notify(error.message || 'Failed to load summary.', 'error');
    }
  }, [notify]);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchHistory({
        page: currentPage,
        limit: LIMIT,
        status: currentStatus,
      });

      setRows(result.data);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (error) {
      notify(error.message || 'Failed to load bookings.', 'error');
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentStatus, notify]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleStatusChange = (status) => {
    setCurrentStatus(status);
    setCurrentPage(1);
  };

  const renderTable = () => {
    if (isLoading) {
      return <div className="history-loading">Loading bookings...</div>;
    }

    if (rows.length === 0) {
      return (
        <div className="history-empty">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p>No bookings found.</p>
        </div>
      );
    }

    return (
      <table className="history-table">
        <thead>
          <tr>
            <th>Room</th>
            <th>Customer</th>
            <th>Date &amp; Time</th>
            <th>Duration</th>
            <th>Total Cost</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td data-label="Room">{row.room_name}</td>
              <td data-label="Customer">{row.customer_name}</td>
              <td data-label="Date & Time">{row.date_display}</td>
              <td data-label="Duration">{formatDurationFromSeconds(row.duration_seconds)}</td>
              <td data-label="Total Cost">PHP {Number(row.total_cost).toLocaleString()}</td>
              <td data-label="Status">
                {row.status === 'active' ? (
                  <span className="status-badge status-badge--active">• Active</span>
                ) : (
                  <span className="status-badge status-badge--ended">Ended</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const from = (currentPage - 1) * LIMIT + 1;
  const to = Math.min(currentPage * LIMIT, total);

  return (
    <div className="history-container">
      <div className="history-header">
        <h2 className="history-header__title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Booking History
        </h2>

        <div className="history-filters">
          {['all', 'active', 'ended'].map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-btn${currentStatus === status ? ' active' : ''}`}
              data-status={status}
              onClick={() => handleStatusChange(status)}
            >
              {status === 'all' ? 'All' : status === 'active' ? 'Active' : 'Ended'}
            </button>
          ))}
        </div>
      </div>

      <div className="history-summary">
        <div className="summary-card">
          <div className="summary-card__value" id="summary-total">
            {summary.totalBookings}
          </div>
          <div className="summary-card__label">Total Bookings</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__value" id="summary-active">
            {summary.activeBookings}
          </div>
          <div className="summary-card__label">Active Now</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__value" id="summary-revenue">
            PHP {Number(summary.totalRevenue).toLocaleString()}
          </div>
          <div className="summary-card__label">Total Revenue</div>
        </div>
      </div>

      <div className="history-table-wrapper">
        <div id="history-body">{renderTable()}</div>

        {totalPages > 1 && (
          <div className="history-pagination" id="history-pagination" style={{ display: 'flex' }}>
            <span id="pagination-info">Showing {from}-{to} of {total}</span>

            <div className="pagination-controls">
              <button
                className="pagination-btn"
                id="prev-page"
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                ? Prev
              </button>

              <button
                className="pagination-btn"
                id="next-page"
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next ?
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}