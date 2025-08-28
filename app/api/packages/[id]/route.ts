// app/api/packages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { deleteUploadthingFile } from "@/lib/uploadthing";
import { db } from "@/db";
import { packages } from "@/db/schema";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the package to retrieve the image URL
    const packageToDelete = await db
      .select()
      .from(packages)
      .where(eq(packages.id, id))
      .limit(1);

    if (packageToDelete.length === 0) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    const pkg = packageToDelete[0];

    // Delete the image from Uploadthing
    if (pkg.image) {
      await deleteUploadthingFile(pkg.image);
    }

    // Delete the package from database
    await db.delete(packages).where(eq(packages.id, id));

    return NextResponse.json(
      { message: "Package deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, image, price, duration } = body;

    // Get current package to check if image changed
    const currentPackage = await db
      .select()
      .from(packages)
      .where(eq(packages.id, id))
      .limit(1);

    if (currentPackage.length === 0) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    const oldImage = currentPackage[0].image;

    // If image changed, delete the old one
    if (oldImage && oldImage !== image) {
      await deleteUploadthingFile(oldImage);
    }

    // Update the package
    const updatedPackage = await db
      .update(packages)
      .set({
        name,
        description,
        image,
        price,
        duration,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning();

    return NextResponse.json(updatedPackage[0]);
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    );
  }
}
