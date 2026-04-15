'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { eventTypesApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadEventTypes();
  }, []);

  async function loadEventTypes() {
    try {
      setLoading(true);
      const data = await eventTypesApi.list();
      setEventTypes(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id, currentActive) {
    try {
      await eventTypesApi.update(id, { isActive: !currentActive });
      setEventTypes(prev =>
        prev.map(e => e.id === id ? { ...e, isActive: !currentActive } : e)
      );
      addToast(`Event type ${!currentActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    try {
      await eventTypesApi.delete(deleteModal);
      setEventTypes(prev => prev.filter(e => e.id !== deleteModal));
      addToast('Event type deleted');
      setDeleteModal(null);
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  function copyLink(slug) {
    const url = `${window.location.origin}/booking/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    addToast('Booking link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="loading-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Types</h1>
          <p className="page-subtitle">Create events to share for people to book on your calendar.</p>
        </div>
        <Link href="/event-types/new" className="btn btn-primary" id="create-event-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Event Type
        </Link>
      </div>

      {eventTypes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 className="empty-state-title">No event types yet</h3>
          <p className="empty-state-text">Create your first event type to start accepting bookings.</p>
          <Link href="/event-types/new" className="btn btn-primary">
            Create Event Type
          </Link>
        </div>
      ) : (
        <div className="event-type-grid">
          {eventTypes.map(event => (
            <div key={event.id} className="event-type-card" id={`event-${event.id}`}>
              <div className="event-type-card-accent" style={{ background: event.color }} />
              <div className="event-type-card-body">
                <div className="event-type-card-header">
                  <div>
                    <div className="event-type-card-name">{event.name}</div>
                    <div className="event-type-card-duration">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      {event.durationMinutes} min
                    </div>
                  </div>
                  <div
                    className={`toggle-switch ${event.isActive ? 'active' : ''}`}
                    onClick={() => handleToggle(event.id, event.isActive)}
                    role="switch"
                    aria-checked={event.isActive}
                    id={`toggle-${event.id}`}
                  />
                </div>
                {event.description && (
                  <div className="event-type-card-description">{event.description}</div>
                )}
              </div>
              <div className="event-type-card-footer">
                <button
                  className={`event-type-card-link ${copiedId === event.slug ? 'copy-feedback' : ''}`}
                  onClick={() => copyLink(event.slug)}
                  id={`copy-link-${event.id}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  {copiedId === event.slug ? 'Copied!' : 'Copy link'}
                </button>
                <div className="event-type-card-actions">
                  <Link href={`/event-types/${event.id}/edit`} className="btn btn-ghost btn-sm" id={`edit-${event.id}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </Link>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setDeleteModal(event.id)}
                    id={`delete-${event.id}`}
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Event Type">
        <p className="modal-text">
          Are you sure you want to delete this event type? This will also cancel all associated bookings. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} id="confirm-delete-btn">Delete</button>
        </div>
      </Modal>
    </>
  );
}
