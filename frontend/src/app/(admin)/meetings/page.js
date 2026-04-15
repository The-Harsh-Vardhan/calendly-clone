'use client';

import { useState, useEffect } from 'react';
import { bookingsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  async function loadBookings() {
    try {
      setLoading(true);
      const data = await bookingsApi.list(activeTab);
      setBookings(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!cancelModal) return;
    try {
      await bookingsApi.cancel(cancelModal);
      setBookings(prev => prev.filter(b => b.id !== cancelModal));
      addToast('Meeting cancelled successfully');
      setCancelModal(null);
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    };
  }

  function formatTimeRange(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    const startTime = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endTime = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${startTime} - ${endTime}`;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">View and manage your scheduled meetings.</p>
        </div>
      </div>

      <div className="meetings-tabs">
        <button
          className={`meetings-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
          id="tab-upcoming"
        >
          Upcoming
        </button>
        <button
          className={`meetings-tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
          id="tab-past"
        >
          Past
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="loading-spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3 className="empty-state-title">No {activeTab} meetings</h3>
          <p className="empty-state-text">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming meetings. Share your booking links to get started."
              : "You don't have any past meetings yet."}
          </p>
        </div>
      ) : (
        <div>
          {bookings.map(booking => {
            const dateInfo = formatDate(booking.startTime);
            return (
              <div key={booking.id} className="meeting-card" id={`meeting-${booking.id}`}>
                <div className="meeting-date-badge">
                  <div className="meeting-date-month">{dateInfo.month}</div>
                  <div className="meeting-date-day">{dateInfo.day}</div>
                </div>
                <div className="meeting-info">
                  <div className="meeting-title">
                    <span className="color-dot" style={{ background: booking.eventType?.color || '#006BFF', marginRight: 8 }} />
                    {booking.eventType?.name}
                  </div>
                  <div className="meeting-time">
                    {dateInfo.weekday} · {formatTimeRange(booking.startTime, booking.endTime)}
                  </div>
                  <div className="meeting-attendee">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {booking.inviteeName} ({booking.inviteeEmail})
                  </div>
                </div>
                <div className="meeting-actions">
                  <span className={`meeting-status ${booking.status}`}>
                    {booking.status === 'confirmed' ? '● Confirmed' : '● Cancelled'}
                  </span>
                  {booking.status === 'confirmed' && activeTab === 'upcoming' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => setCancelModal(booking.id)}
                      id={`cancel-${booking.id}`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Meeting">
        <p className="modal-text">
          Are you sure you want to cancel this meeting? The invitee will be notified via email.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setCancelModal(null)}>Keep Meeting</button>
          <button className="btn btn-danger" onClick={handleCancel} id="confirm-cancel-btn">Cancel Meeting</button>
        </div>
      </Modal>
    </>
  );
}
