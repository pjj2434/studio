// app/api/packages/route.ts
import { NextRequest, NextResponse } from "next/server";

import { nanoid } from "nanoid";
import { packages } from "@/db/schema";
import { db } from "@/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, price, duration } = body;

    const newPackage = await db
      .insert(packages)
      .values({
        id: nanoid(),
        name,
        description,
        image,
        price,
        duration,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "admin", // Replace with actual user ID from auth
      })
      .returning();

    return NextResponse.json(newPackage[0], { status: 201 });
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allPackages = await db.select().from(packages);
    return NextResponse.json(allPackages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
