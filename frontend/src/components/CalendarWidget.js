'use client';

import { useState, useMemo } from 'react';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function CalendarWidget({ selectedDate, onDateSelect, availableDates = [], availableDays = [] }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const days = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    // Get Monday-based day of week (0=Mon, 6=Sun)
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];

    // Add empty slots for days before the 1st
    for (let i = 0; i < startDow; i++) {
      result.push({ day: null, date: null });
    }

    // Add days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = formatDateStr(date);
      const isPast = date < today;
      const jsDow = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      
      // Check if this day of week is in the available days list
      const isDayAvailable = availableDays.length === 0 || availableDays.includes(jsDow);
      const isDateAvailable = availableDates.length === 0 || availableDates.includes(dateStr);
      const isAvailable = !isPast && isDayAvailable && isDateAvailable;
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate === dateStr;

      result.push({
        day: d,
        date: dateStr,
        isPast,
        isAvailable,
        isToday,
        isSelected
      });
    }

    return result;
  }, [currentMonth, today, selectedDate, availableDates, availableDays]);

  const monthLabel = useMemo(() => {
    const { year, month } = currentMonth;
    return new Date(year, month, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentMonth]);

  function prevMonth() {
    setCurrentMonth(prev => {
      const m = prev.month - 1;
      if (m < 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: m };
    });
  }

  function nextMonth() {
    setCurrentMonth(prev => {
      const m = prev.month + 1;
      if (m > 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: m };
    });
  }

  const isPrevDisabled = useMemo(() => {
    const { year, month } = currentMonth;
    return year === today.getFullYear() && month === today.getMonth();
  }, [currentMonth, today]);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={prevMonth}
          disabled={isPrevDisabled}
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        <span className="calendar-month-title">{monthLabel}</span>
        <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Next month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9,6 15,12 9,18"/>
          </svg>
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((d, i) => {
          if (!d.day) {
            return <div key={`empty-${i}`} className="calendar-day disabled" />;
          }

          const classes = ['calendar-day'];
          if (d.isToday) classes.push('today');
          if (d.isSelected) classes.push('selected');
          if (d.isPast) classes.push('disabled');
          else if (d.isAvailable) classes.push('available');
          else classes.push('disabled');

          return (
            <button
              key={d.date}
              className={classes.join(' ')}
              onClick={() => d.isAvailable && onDateSelect(d.date)}
              disabled={!d.isAvailable}
              aria-label={`Select ${d.date}`}
            >
              {d.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
