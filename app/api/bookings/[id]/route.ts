import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, adminNotes } = body;

    console.log(`📝 Updating booking ${id}:`, { status, adminNotes });

    // Get the current booking details
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = existingBooking[0];
    console.log('Current booking:', {
      id: booking.id,
      status: booking.status,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    });

    // Update the booking
    const updatedBooking = await db
      .update(bookings)
      .set({
        status,
        adminNotes,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();

    console.log('✅ Booking updated:', updatedBooking[0]);

    // Log status change for availability management
    if (status === 'approved' && booking.status !== 'approved') {
      console.log('🔒 Booking approved - time slot now unavailable:', {
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        availabilityId: booking.availabilityId
      });
    }

    if ((status === 'cancelled' || status === 'rejected') && booking.status === 'approved') {
      console.log('🔓 Approved booking cancelled/rejected - time slot potentially available again:', {
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        availabilityId: booking.availabilityId
      });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking[0]
    });

  } catch (error) {
    console.error('❌ Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking[0]);

  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
