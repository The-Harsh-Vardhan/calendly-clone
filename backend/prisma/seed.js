import { PrismaClient } from '@prisma/client';
import { addDays, addHours, setHours, setMinutes, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.dateOverride.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.availabilitySchedule.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.user.deleteMany();

  // Create default user
  const user = await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Harsh Vardhan',
      email: 'harsh@example.com',
      timezone: 'Asia/Kolkata'
    }
  });
  console.log('✅ Created user:', user.name);

  // Create event types
  const eventTypes = await Promise.all([
    prisma.eventType.create({
      data: {
        userId: user.id,
        name: '30 Minute Meeting',
        slug: '30-min-meeting',
        durationMinutes: 30,
        description: 'A quick 30-minute catch-up call to discuss your needs and how I can help.',
        color: '#006BFF'
      }
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        name: '60 Minute Consultation',
        slug: '60-min-consultation',
        durationMinutes: 60,
        description: 'An in-depth consultation to dive deep into your requirements and create an action plan.',
        color: '#FF6B00'
      }
    }),
    prisma.eventType.create({
      data: {
        userId: user.id,
        name: '15 Minute Quick Chat',
        slug: '15-min-quick-chat',
        durationMinutes: 15,
        description: 'A brief introductory call to see if we are a good fit.',
        color: '#00A854'
      }
    })
  ]);
  console.log('✅ Created', eventTypes.length, 'event types');

  // Create availability schedule (Mon-Fri, 9 AM - 5 PM IST)
  const schedule = await prisma.availabilitySchedule.create({
    data: {
      userId: user.id,
      name: 'Working Hours',
      timezone: 'Asia/Kolkata',
      isDefault: true
    }
  });

  // Monday (1) through Friday (5)
  const rules = [];
  for (let day = 1; day <= 5; day++) {
    rules.push({
      scheduleId: schedule.id,
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00'
    });
  }

  await prisma.availabilityRule.createMany({ data: rules });
  console.log('✅ Created availability schedule (Mon-Fri 9AM-5PM)');

  // Create sample bookings
  const now = new Date();
  const tomorrow = addDays(startOfDay(now), 1);
  const dayAfter = addDays(startOfDay(now), 2);
  const nextWeek = addDays(startOfDay(now), 7);
  const lastWeek = addDays(startOfDay(now), -3);

  const bookings = await Promise.all([
    // Upcoming booking 1
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[0].id,
        inviteeName: 'Priya Sharma',
        inviteeEmail: 'priya@example.com',
        startTime: setMinutes(setHours(tomorrow, 10), 0),
        endTime: setMinutes(setHours(tomorrow, 10), 30),
        timezone: 'Asia/Kolkata',
        status: 'confirmed',
        notes: 'Want to discuss the Q3 project timeline.'
      }
    }),
    // Upcoming booking 2
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[1].id,
        inviteeName: 'Rahul Verma',
        inviteeEmail: 'rahul@example.com',
        startTime: setMinutes(setHours(dayAfter, 14), 0),
        endTime: setMinutes(setHours(dayAfter, 15), 0),
        timezone: 'Asia/Kolkata',
        status: 'confirmed'
      }
    }),
    // Upcoming booking 3
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[2].id,
        inviteeName: 'Ananya Patel',
        inviteeEmail: 'ananya@example.com',
        startTime: setMinutes(setHours(nextWeek, 11), 0),
        endTime: setMinutes(setHours(nextWeek, 11), 15),
        timezone: 'America/New_York',
        status: 'confirmed',
        notes: 'Quick intro chat about collaboration.'
      }
    }),
    // Past booking 1
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[0].id,
        inviteeName: 'Vikram Singh',
        inviteeEmail: 'vikram@example.com',
        startTime: setMinutes(setHours(lastWeek, 9), 0),
        endTime: setMinutes(setHours(lastWeek, 9), 30),
        timezone: 'Asia/Kolkata',
        status: 'confirmed'
      }
    }),
    // Past cancelled booking
    prisma.booking.create({
      data: {
        eventTypeId: eventTypes[1].id,
        inviteeName: 'Neha Gupta',
        inviteeEmail: 'neha@example.com',
        startTime: setMinutes(setHours(lastWeek, 15), 0),
        endTime: setMinutes(setHours(lastWeek, 16), 0),
        timezone: 'Asia/Kolkata',
        status: 'cancelled',
        cancelledAt: addDays(lastWeek, -1)
      }
    })
  ]);
  console.log('✅ Created', bookings.length, 'sample bookings');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
