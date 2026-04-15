import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default user ID (seeded)
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/event-types
export async function listEventTypes(req, res, next) {
  try {
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { bookings: true } }
      }
    });
    res.json(eventTypes);
  } catch (err) {
    next(err);
  }
}

// GET /api/event-types/:slug
export async function getEventTypeBySlug(req, res, next) {
  try {
    const eventType = await prisma.eventType.findUnique({
      where: { slug: req.params.slug },
      include: {
        user: { select: { name: true, email: true, timezone: true } }
      }
    });
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    res.json(eventType);
  } catch (err) {
    next(err);
  }
}

// GET /api/event-types/:id/details
export async function getEventTypeById(req, res, next) {
  try {
    const eventType = await prisma.eventType.findUnique({
      where: { id: req.params.id }
    });
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    res.json(eventType);
  } catch (err) {
    next(err);
  }
}

// POST /api/event-types
export async function createEventType(req, res, next) {
  try {
    const { name, slug, durationMinutes, description, color } = req.body;

    if (!name || !slug || !durationMinutes) {
      return res.status(400).json({ error: 'Name, slug, and duration are required' });
    }

    const eventType = await prisma.eventType.create({
      data: {
        userId: DEFAULT_USER_ID,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        durationMinutes: parseInt(durationMinutes),
        description: description || null,
        color: color || '#006BFF'
      }
    });
    res.status(201).json(eventType);
  } catch (err) {
    next(err);
  }
}

// PUT /api/event-types/:id
export async function updateEventType(req, res, next) {
  try {
    const { name, slug, durationMinutes, description, color, isActive } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (durationMinutes !== undefined) data.durationMinutes = parseInt(durationMinutes);
    if (description !== undefined) data.description = description;
    if (color !== undefined) data.color = color;
    if (isActive !== undefined) data.isActive = isActive;

    const eventType = await prisma.eventType.update({
      where: { id: req.params.id },
      data
    });
    res.json(eventType);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/event-types/:id
export async function deleteEventType(req, res, next) {
  try {
    await prisma.eventType.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Event type deleted' });
  } catch (err) {
    next(err);
  }
}
