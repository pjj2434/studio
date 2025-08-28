import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    console.log('🔍 Checking availability for:', { date, startTime, endTime });

    // Check for overlapping approved bookings
    const overlappingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.date, date),
          eq(bookings.status, 'approved')
        )
      );

    // Check for time conflicts
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestStart = timeToMinutes(startTime);
    const requestEnd = timeToMinutes(endTime);

    const conflicts = overlappingBookings.filter(booking => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      
      // Check if times overlap
      return requestStart < bookingEnd && requestEnd > bookingStart;
    });

    const available = conflicts.length === 0;

    console.log('Availability check result:', {
      date,
      startTime,
      endTime,
      totalBookings: overlappingBookings.length,
      conflicts: conflicts.length,
      available
    });

    return NextResponse.json({
      available,
      conflicts: conflicts.length,
      conflictingBookings: conflicts.map(b => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        customerName: b.name
      }))
    });

  } catch (error) {
    console.error('❌ Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
