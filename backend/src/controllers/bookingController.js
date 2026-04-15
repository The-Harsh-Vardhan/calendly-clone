import { PrismaClient } from '@prisma/client';
import { addMinutes } from 'date-fns';

const prisma = new PrismaClient();
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// POST /api/bookings
export async function createBooking(req, res, next) {
  try {
    const { eventTypeId, startTime, inviteeName, inviteeEmail, timezone, notes } = req.body;

    if (!eventTypeId || !startTime || !inviteeName || !inviteeEmail) {
      return res.status(400).json({
        error: 'eventTypeId, startTime, inviteeName, and inviteeEmail are required'
      });
    }

    // Get event type for duration
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId }
    });

    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    const bookingStart = new Date(startTime);
    const bookingEnd = addMinutes(bookingStart, eventType.durationMinutes);

    // Check for double booking
    const conflicting = await prisma.booking.findFirst({
      where: {
        eventTypeId,
        status: 'confirmed',
        OR: [
          {
            startTime: { lt: bookingEnd },
            endTime: { gt: bookingStart }
          }
        ]
      }
    });

    if (conflicting) {
      return res.status(409).json({
        error: 'This time slot is already booked. Please choose another time.'
      });
    }

    const booking = await prisma.booking.create({
      data: {
        eventTypeId,
        inviteeName,
        inviteeEmail,
        startTime: bookingStart,
        endTime: bookingEnd,
        timezone: timezone || 'Asia/Kolkata',
        notes: notes || null,
        status: 'confirmed'
      },
      include: {
        eventType: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings
export async function listBookings(req, res, next) {
  try {
    const { type } = req.query; // 'upcoming' or 'past'
    const now = new Date();

    let where = {
      eventType: { userId: DEFAULT_USER_ID }
    };

    if (type === 'upcoming') {
      where.startTime = { gte: now };
      where.status = 'confirmed';
    } else if (type === 'past') {
      where.startTime = { lt: now };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        eventType: {
          select: { name: true, durationMinutes: true, color: true, slug: true }
        }
      },
      orderBy: { startTime: type === 'past' ? 'desc' : 'asc' }
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/bookings/:id/cancel
export async function cancelBooking(req, res, next) {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      },
      include: {
        eventType: {
          select: { name: true, durationMinutes: true }
        }
      }
    });

    res.json(booking);
  } catch (err) {
    next(err);
  }
}
