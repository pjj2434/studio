// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { availability } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET all availability slots
export async function GET() {
  try {
    const slots = await db.select().from(availability).orderBy(availability.date);
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ 
      error: "Failed to fetch availability", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

// POST create new slot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime } = body;
    
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

    // Check for overlapping slots on the same date
    try {
      const existingSlots = await db.select().from(availability).where(eq(availability.date, date));
      for (const slot of existingSlots) {
        if (
          (startTime >= slot.startTime && startTime < slot.endTime) ||
          (endTime > slot.startTime && endTime <= slot.endTime) ||
          (startTime <= slot.startTime && endTime >= slot.endTime)
        ) {
          return NextResponse.json({ error: "Time slot overlaps with existing availability" }, { status: 400 });
        }
      }
    } catch (overlapError) {
      console.error("Error checking overlaps:", overlapError);
    }

    const now = new Date();
    const newSlot = {
      id: nanoid(),
      date,
      startTime,
      endTime,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await db.insert(availability).values(newSlot).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error creating availability:", error);
    return NextResponse.json({ 
      error: "Failed to create availability", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
