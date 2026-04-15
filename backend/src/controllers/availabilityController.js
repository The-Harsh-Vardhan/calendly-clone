import { PrismaClient } from '@prisma/client';
import { addMinutes, format, parse, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const prisma = new PrismaClient();

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/availability
export async function getAvailability(req, res, next) {
  try {
    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: DEFAULT_USER_ID, isDefault: true },
      include: {
        rules: { orderBy: { dayOfWeek: 'asc' } },
        dateOverrides: true
      }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'No availability schedule found' });
    }

    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

// PUT /api/availability
export async function updateAvailability(req, res, next) {
  try {
    const { timezone, rules } = req.body;

    // Find or create default schedule
    let schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: DEFAULT_USER_ID, isDefault: true }
    });

    if (!schedule) {
      schedule = await prisma.availabilitySchedule.create({
        data: {
          userId: DEFAULT_USER_ID,
          name: 'Working Hours',
          timezone: timezone || 'Asia/Kolkata',
          isDefault: true
        }
      });
    } else if (timezone) {
      await prisma.availabilitySchedule.update({
        where: { id: schedule.id },
        data: { timezone }
      });
    }

    // Delete existing rules and recreate
    if (rules) {
      await prisma.availabilityRule.deleteMany({
        where: { scheduleId: schedule.id }
      });

      await prisma.availabilityRule.createMany({
        data: rules.map(rule => ({
          scheduleId: schedule.id,
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime
        }))
      });
    }

    // Fetch updated schedule
    const updated = await prisma.availabilitySchedule.findUnique({
      where: { id: schedule.id },
      include: {
        rules: { orderBy: { dayOfWeek: 'asc' } },
        dateOverrides: true
      }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// GET /api/availability/:slug/:date
// Returns available time slots for a given event type and date
export async function getAvailableSlots(req, res, next) {
  try {
    const { slug, date } = req.params;
    const requestedTimezone = req.query.timezone || 'Asia/Kolkata';

    // Get event type
    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: { user: true }
    });

    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    // Get user's default availability schedule
    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: eventType.userId, isDefault: true },
      include: {
        rules: true,
        dateOverrides: true
      }
    });

    if (!schedule) {
      return res.json({ slots: [] });
    }

    // Parse the requested date
    const requestedDate = parseISO(date);
    const dayOfWeek = requestedDate.getDay(); // 0=Sunday

    // Check for date-specific overrides
    const override = schedule.dateOverrides.find(o => o.date === date);

    let timeRanges = [];

    if (override) {
      if (override.isUnavailable) {
        return res.json({ slots: [] });
      }
      timeRanges = [{ startTime: override.startTime, endTime: override.endTime }];
    } else {
      // Get rules for this day of week
      const dayRules = schedule.rules.filter(r => r.dayOfWeek === dayOfWeek);
      if (dayRules.length === 0) {
        return res.json({ slots: [] });
      }
      timeRanges = dayRules.map(r => ({ startTime: r.startTime, endTime: r.endTime }));
    }

    // Get existing bookings for this date
    const dayStart = startOfDay(requestedDate);
    const dayEnd = endOfDay(requestedDate);

    const existingBookings = await prisma.booking.findMany({
      where: {
        eventTypeId: eventType.id,
        status: 'confirmed',
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd }
      }
    });

    // Generate time slots
    const slots = [];
    const duration = eventType.durationMinutes;
    const scheduleTimezone = schedule.timezone;

    for (const range of timeRanges) {
      const [startHour, startMin] = range.startTime.split(':').map(Number);
      const [endHour, endMin] = range.endTime.split(':').map(Number);

      // Create times in the schedule's timezone
      const baseDate = parseISO(date);
      let slotStart = new Date(baseDate);
      slotStart.setHours(startHour, startMin, 0, 0);

      const rangeEnd = new Date(baseDate);
      rangeEnd.setHours(endHour, endMin, 0, 0);

      // Convert to UTC for proper comparison
      const slotStartUTC = fromZonedTime(slotStart, scheduleTimezone);
      const rangeEndUTC = fromZonedTime(rangeEnd, scheduleTimezone);

      let currentSlotUTC = new Date(slotStartUTC);

      while (addMinutes(currentSlotUTC, duration) <= rangeEndUTC) {
        const slotEndUTC = addMinutes(currentSlotUTC, duration);

        // Check if slot conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          return currentSlotUTC < bookingEnd && slotEndUTC > bookingStart;
        });

        // Check if slot is in the past
        const now = new Date();
        const isInPast = currentSlotUTC <= now;

        if (!hasConflict && !isInPast) {
          // Convert to requested timezone for display
          const displayStart = toZonedTime(currentSlotUTC, requestedTimezone);
          slots.push({
            startTime: currentSlotUTC.toISOString(),
            endTime: slotEndUTC.toISOString(),
            displayTime: format(displayStart, 'h:mma').toLowerCase()
          });
        }

        currentSlotUTC = addMinutes(currentSlotUTC, 15); // 15-minute intervals
      }
    }

    res.json({
      slots,
      eventType: {
        id: eventType.id,
        name: eventType.name,
        duration: eventType.durationMinutes,
        description: eventType.description,
        color: eventType.color
      },
      user: {
        name: eventType.user.name
      }
    });
  } catch (err) {
    next(err);
  }
}
