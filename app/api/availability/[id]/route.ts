// app/api/availability/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { availability } from "@/db/schema";

// PUT update slot
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, isActive } = body;
    
    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields: date, startTime, endTime" }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // Validate time format (HH:MM)
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime) || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
      return NextResponse.json({ error: "Invalid time format. Use HH:MM" }, { status: 400 });
    }

    // Check if end time is after start time
    if (startTime >= endTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    // Check for overlapping slots on the same date (excluding current slot)
    const existingSlots = await db.select().from(availability).where(eq(availability.date, date));
    for (const slot of existingSlots) {
      if (slot.id === params.id) continue; // Skip current slot
      
      if (
        (startTime >= slot.startTime && startTime < slot.endTime) ||
        (endTime > slot.startTime && endTime <= slot.endTime) ||
        (startTime <= slot.startTime && endTime >= slot.endTime)
      ) {
        return NextResponse.json({ error: "Time slot overlaps with existing availability" }, { status: 400 });
      }
    }

    const now = new Date(); // Use Date object instead of Date.now()
    
    const updated = await db.update(availability)
      .set({ 
        date, 
        startTime, 
        endTime, 
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: now 
      })
      .where(eq(availability.id, params.id))
      .returning();
    
    if (updated.length === 0) {
      return NextResponse.json({ error: "Availability slot not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 });
  }
}

// DELETE slot
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await db.delete(availability)
      .where(eq(availability.id, params.id))
      .returning();
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Availability slot not found" }, { status: 404 });
    }
    
    return NextResponse.json({ id: params.id, message: "Availability slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json({ error: "Failed to delete availability" }, { status: 500 });
  }
}
