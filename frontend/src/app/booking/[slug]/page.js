'use client';

import { useState, useEffect, use } from 'react';
import { availabilityApi, bookingsApi, eventTypesApi } from '@/lib/api';
import CalendarWidget from '@/components/CalendarWidget';

export default function BookingPage({ params }) {
  const { slug } = use(params);
  const [eventType, setEventType] = useState(null);
  const [hostName, setHostName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking flow state
  const [step, setStep] = useState('calendar'); // calendar | form | confirmed
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedSlot, setConfirmedSlot] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Timezone
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Asia/Kolkata';
    }
  });

  // Available days of week (fetched from schedule)
  const [availableDays, setAvailableDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default

  useEffect(() => {
    async function load() {
      try {
        const data = await eventTypesApi.getBySlug(slug);
        setEventType(data);
        setHostName(data.user?.name || 'Host');

        // Also fetch availability to know which days are available
        try {
          const schedule = await availabilityApi.get();
          const days = schedule.rules.map(r => r.dayOfWeek);
          if (days.length > 0) setAvailableDays(days);
        } catch {}
      } catch (err) {
        setError('Event type not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  async function handleDateSelect(dateStr) {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setConfirmedSlot(null);
    setSlotsLoading(true);
    try {
      const data = await availabilityApi.getSlots(slug, dateStr, timezone);
      setSlots(data.slots || []);
    } catch (err) {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  function handleSlotClick(slot) {
    if (selectedSlot?.startTime === slot.startTime) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  }

  function handleConfirmSlot() {
    if (!selectedSlot) return;
    setConfirmedSlot(selectedSlot);
    setStep('form');
  }

  function handleBackToCalendar() {
    setStep('calendar');
    setConfirmedSlot(null);
  }

  async function handleSubmitBooking(e) {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      setSubmitting(true);
      const result = await bookingsApi.create({
        eventTypeId: eventType.id,
        startTime: confirmedSlot.startTime,
        inviteeName: formData.name,
        inviteeEmail: formData.email,
        timezone,
        notes: formData.notes || undefined
      });
      setBookingResult(result);
      setStep('confirmed');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function formatSelectedDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatDateTime(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function formatFullDateTime(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading-center"><div className="loading-spinner" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-page">
        <div className="confirmation-card">
          <div className="confirmation-icon" style={{ background: 'var(--color-danger-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="confirmation-title">Event Not Found</h2>
          <p className="confirmation-subtitle">This booking link is invalid or the event type has been removed.</p>
        </div>
      </div>
    );
  }

  // ── CONFIRMED STEP ──
  if (step === 'confirmed' && bookingResult) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card">
          <div className="confirmation-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="confirmation-title">You are scheduled</h2>
          <p className="confirmation-subtitle">
            A calendar invitation has been sent to your email address.
          </p>

          <div className="confirmation-details">
            <div className="confirmation-detail-row">
              <span className="confirmation-detail-label">What</span>
              <span className="confirmation-detail-value">{eventType.name}</span>
            </div>
            <div className="confirmation-detail-row">
              <span className="confirmation-detail-label">When</span>
              <span className="confirmation-detail-value">
                {formatFullDateTime(bookingResult.startTime)}
                <br />
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                  {timezone.replace(/_/g, ' ')}
                </span>
              </span>
            </div>
            <div className="confirmation-detail-row">
              <span className="confirmation-detail-label">Who</span>
              <span className="confirmation-detail-value">
                {hostName}
                <br />
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                  {bookingResult.inviteeName} ({bookingResult.inviteeEmail})
                </span>
              </span>
            </div>
            {bookingResult.notes && (
              <div className="confirmation-detail-row">
                <span className="confirmation-detail-label">Notes</span>
                <span className="confirmation-detail-value">{bookingResult.notes}</span>
              </div>
            )}
          </div>

          <a href={`/booking/${slug}`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Schedule another meeting
          </a>
        </div>
      </div>
    );
  }

  // ── FORM STEP ──
  if (step === 'form') {
    return (
      <div className="booking-page">
        <div className="booking-card with-form">
          <div className="booking-sidebar">
            <button className="booking-back-btn" onClick={handleBackToCalendar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Back
            </button>

            <div className="booking-host-avatar">{hostName.charAt(0)}</div>
            <div className="booking-host-name">{hostName}</div>
            <h2 className="booking-event-name">{eventType.name}</h2>

            <div className="booking-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              {eventType.durationMinutes} min
            </div>

            <div className="booking-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatDateTime(confirmedSlot.startTime)} - {formatDateTime(confirmedSlot.endTime)}, {formatSelectedDate(selectedDate)}
            </div>

            <div className="booking-detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {timezone.replace(/_/g, ' ')}
            </div>

            {eventType.description && (
              <div className="booking-description">{eventType.description}</div>
            )}
          </div>

          <div className="booking-main">
            <h3 className="booking-main-title">Enter Details</h3>
            <form onSubmit={handleSubmitBooking}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="booking-name">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    id="booking-name"
                    className="form-input"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="booking-email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    id="booking-email"
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="booking-notes">
                  Additional Notes
                </label>
                <textarea
                  id="booking-notes"
                  className="form-input"
                  placeholder="Please share anything that will help prepare for our meeting..."
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                />
              </div>

              <div style={{ paddingTop: 8 }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                  By proceeding, you confirm that you have read and agree to the scheduling terms.
                </p>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                  id="schedule-event-btn"
                  style={{ width: '100%' }}
                >
                  {submitting ? 'Scheduling...' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── CALENDAR STEP ──
  return (
    <div className="booking-page">
      <div className={`booking-card ${selectedDate ? 'with-slots' : ''}`}>
        {/* Left sidebar */}
        <div className="booking-sidebar">
          <div className="booking-host-avatar">{hostName.charAt(0)}</div>
          <div className="booking-host-name">{hostName}</div>
          <h2 className="booking-event-name">{eventType.name}</h2>

          <div className="booking-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {eventType.durationMinutes} min
          </div>

          {eventType.description && (
            <div className="booking-description">{eventType.description}</div>
          )}

          <div className="timezone-selector" style={{ marginTop: 'auto' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span style={{ fontWeight: 600 }}>Time zone</span>
            <select
              className="timezone-select"
              value={timezone}
              onChange={e => {
                setTimezone(e.target.value);
                if (selectedDate) handleDateSelect(selectedDate);
              }}
            >
              {[
                'Asia/Kolkata', 'America/New_York', 'America/Chicago', 'America/Denver',
                'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo',
                'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland'
              ].map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar area */}
        <div className="booking-main">
          <h3 className="booking-main-title">Select a Date &amp; Time</h3>
          <CalendarWidget
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            availableDays={availableDays}
          />
        </div>

        {/* Time slots (shown when date is selected) */}
        {selectedDate && (
          <div className="time-slots-container" style={{ padding: 'var(--space-xl)' }}>
            <div className="time-slots-date">{formatSelectedDate(selectedDate)}</div>

            {slotsLoading ? (
              <div className="loading-center"><div className="loading-spinner" /></div>
            ) : slots.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No available times for this date.
              </p>
            ) : (
              <div className="time-slots-list">
                {slots.map(slot => (
                  <div key={slot.startTime}>
                    {selectedSlot?.startTime === slot.startTime ? (
                      <div className="time-slot-confirm">
                        <div className="time-slot-selected">{slot.displayTime}</div>
                        <button
                          className="btn-confirm"
                          onClick={handleConfirmSlot}
                          id="confirm-time-btn"
                        >
                          Next
                        </button>
                      </div>
                    ) : (
                      <button
                        className="time-slot-btn"
                        onClick={() => handleSlotClick(slot)}
                      >
                        {slot.displayTime}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
