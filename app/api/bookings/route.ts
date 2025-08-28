import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, packages, emailNotifications } from '@/db/schema';
import { sendBookingRequestEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';

// POST method for creating bookings
export async function POST(request: NextRequest) {
  console.log('🚀 Booking API POST called');
  
  try {
    const data = await request.json();
    console.log('📝 Request data received:', data);
    
    const {
      name,
      email,
      phone,
      message,
      date,
      startTime,
      endTime,
      packageId,
      availabilityId,
      duration
    } = data;

    // Validate required fields
    if (!name || !email || !phone || !date || !startTime || !endTime || !packageId) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if package exists and get its details
    const packageExists = await db
      .select()
      .from(packages)
      .where(eq(packages.id, packageId))
      .limit(1);

    if (packageExists.length === 0) {
      console.log('❌ Package not found:', packageId);
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const selectedPackage = packageExists[0];
    
    // Use duration from request or fallback to package duration
    const bookingDuration = duration || selectedPackage.duration;

    console.log('📦 Package details:', {
      id: selectedPackage.id,
      name: selectedPackage.name,
      duration: selectedPackage.duration,
      requestedDuration: duration,
      finalDuration: bookingDuration
    });

    // Check for conflicting approved bookings
    const conflictingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.date, date),
          eq(bookings.status, 'approved')
        )
      );

    // Check for time conflicts
    const hasTimeConflict = conflictingBookings.some(booking => {
      const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const newStart = timeToMinutes(startTime);
      const newEnd = timeToMinutes(endTime);
      const existingStart = timeToMinutes(booking.startTime);
      const existingEnd = timeToMinutes(booking.endTime);

      const overlap = newStart < existingEnd && newEnd > existingStart;
      
      if (overlap) {
        console.log('⚠️ Time conflict detected:', {
          newSlot: `${startTime}-${endTime}`,
          existingSlot: `${booking.startTime}-${booking.endTime}`,
          existingBookingId: booking.id
        });
      }

      return overlap;
    });

    if (hasTimeConflict) {
      console.log('❌ Time slot conflict detected');
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    const bookingId = uuidv4();
    const now = new Date();
    
    console.log('💾 Creating booking with data:', {
      id: bookingId,
      name,
      email,
      phone,
      date,
      startTime,
      endTime,
      packageId,
      availabilityId,
      duration: bookingDuration,
      status: 'pending'
    });

    // Create the booking with all required fields
    const newBooking = await db
      .insert(bookings)
      .values({
        id: bookingId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message?.trim() || '',
        date,
        startTime,
        endTime,
        packageId,
        availabilityId: availabilityId || null,
        duration: bookingDuration,
        status: 'pending',
        adminNotes: null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    console.log('✅ Booking created successfully:', newBooking[0]);

    // Send email notification
    try {
      console.log('📧 Sending booking confirmation email...');
      await sendBookingRequestEmail({
        customerName: name,
        customerEmail: email,
        packageName: selectedPackage.name,
        date,
        startTime,
        endTime,
        price: selectedPackage.price,
        duration: bookingDuration,
        message: message || ''
      });

      // Log email notification
      await db.insert(emailNotifications).values({
        id: uuidv4(),
        bookingId,
        type: 'booking_request',
        recipient: email,
        status: 'sent',
        sentAt: now,
        createdAt: now
      });

      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully! You will receive a confirmation email shortly.',
      booking: newBooking[0]
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Booking creation failed:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}

// GET method for fetching bookings
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching all bookings...');
    
    const allBookings = await db
      .select({
        id: bookings.id,
        name: bookings.name,
        email: bookings.email,
        phone: bookings.phone,
        message: bookings.message,
        date: bookings.date,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        packageId: bookings.packageId,
        availabilityId: bookings.availabilityId,
        duration: bookings.duration,
        status: bookings.status,
        adminNotes: bookings.adminNotes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt
      })
      .from(bookings)
      .orderBy(bookings.createdAt);

    console.log(`✅ Found ${allBookings.length} bookings`);

    return NextResponse.json(allBookings);

  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
