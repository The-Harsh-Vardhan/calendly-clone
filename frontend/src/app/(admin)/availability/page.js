'use client';

import { useState, useEffect } from 'react';
import { availabilityApi } from '@/lib/api';
import { useToast } from '@/components/Toast';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland'
];

export default function AvailabilityPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [days, setDays] = useState(
    DAYS.map(d => ({
      dayOfWeek: d.value,
      enabled: d.value >= 1 && d.value <= 5,
      startTime: '09:00',
      endTime: '17:00'
    }))
  );

  useEffect(() => {
    loadAvailability();
  }, []);

  async function loadAvailability() {
    try {
      const schedule = await availabilityApi.get();
      setTimezone(schedule.timezone);

      const updatedDays = DAYS.map(d => {
        const rule = schedule.rules.find(r => r.dayOfWeek === d.value);
        return {
          dayOfWeek: d.value,
          enabled: !!rule,
          startTime: rule?.startTime || '09:00',
          endTime: rule?.endTime || '17:00'
        };
      });
      setDays(updatedDays);
    } catch (err) {
      // No schedule yet — use defaults
    } finally {
      setLoading(false);
    }
  }

  function toggleDay(dayOfWeek) {
    setDays(prev =>
      prev.map(d =>
        d.dayOfWeek === dayOfWeek ? { ...d, enabled: !d.enabled } : d
      )
    );
  }

  function updateTime(dayOfWeek, field, value) {
    setDays(prev =>
      prev.map(d =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      const rules = days
        .filter(d => d.enabled)
        .map(d => ({
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime
        }));

      await availabilityApi.update({ timezone, rules });
      addToast('Availability updated successfully!');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="loading-center"><div className="loading-spinner" /></div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Availability</h1>
          <p className="page-subtitle">Set your weekly hours when you're available for meetings.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-availability-btn">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="timezone-select">Timezone</label>
          <select
            id="timezone-select"
            className="form-input form-select"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            style={{ maxWidth: 350 }}
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="availability-grid">
        {days.map(day => {
          const label = DAYS.find(d => d.value === day.dayOfWeek).label;
          return (
            <div key={day.dayOfWeek} className="availability-day" id={`day-${day.dayOfWeek}`}>
              <div className="availability-day-toggle">
                <div
                  className={`toggle-switch ${day.enabled ? 'active' : ''}`}
                  onClick={() => toggleDay(day.dayOfWeek)}
                  role="switch"
                  aria-checked={day.enabled}
                />
                <span className={`availability-day-name ${!day.enabled ? 'disabled' : ''}`}>
                  {label}
                </span>
              </div>

              {day.enabled ? (
                <div className="availability-times">
                  <input
                    type="time"
                    className="availability-time-input form-input"
                    value={day.startTime}
                    onChange={e => updateTime(day.dayOfWeek, 'startTime', e.target.value)}
                  />
                  <span className="availability-time-separator">—</span>
                  <input
                    type="time"
                    className="availability-time-input form-input"
                    value={day.endTime}
                    onChange={e => updateTime(day.dayOfWeek, 'endTime', e.target.value)}
                  />
                </div>
              ) : (
                <span className="availability-unavailable">Unavailable</span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
