'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventTypesApi } from '@/lib/api';
import { useToast } from '@/components/Toast';

const COLORS = ['#006BFF', '#FF6B00', '#00A854', '#9333EA', '#E5484D', '#0891B2', '#D946EF', '#F59E0B'];

export default function NewEventTypePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    durationMinutes: 30,
    description: '',
    color: '#006BFF'
  });

  function handleNameChange(e) {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    setForm(prev => ({ ...prev, name, slug }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      addToast('Name and URL slug are required', 'error');
      return;
    }

    try {
      setLoading(true);
      await eventTypesApi.create(form);
      addToast('Event type created successfully!');
      router.push('/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Event Type</h1>
          <p className="page-subtitle">Create a new event type for people to book.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="event-name">
              Event Name <span className="required">*</span>
            </label>
            <input
              id="event-name"
              className="form-input"
              type="text"
              placeholder="e.g. 30 Minute Meeting"
              value={form.name}
              onChange={handleNameChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-slug">
              URL Slug <span className="required">*</span>
            </label>
            <input
              id="event-slug"
              className="form-input"
              type="text"
              placeholder="30-minute-meeting"
              value={form.slug}
              onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
            <p className="form-helper">
              Your booking link: {typeof window !== 'undefined' ? window.location.origin : ''}/booking/{form.slug || 'your-event'}
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="event-duration">
                Duration (minutes) <span className="required">*</span>
              </label>
              <select
                id="event-duration"
                className="form-input form-select"
                value={form.durationMinutes}
                onChange={e => setForm(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, color: c }))}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: c,
                      border: form.color === c ? '3px solid var(--color-text-primary)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      outline: form.color === c ? '2px solid white' : 'none',
                      outlineOffset: '-5px'
                    }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              className="form-input"
              placeholder="Describe what this meeting is about..."
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-event-btn">
              {loading ? 'Creating...' : 'Create Event Type'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
