// app/admin/__components/packagecard.tsx
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, DollarSign } from "lucide-react";
import { Package } from "@/types";
import Image from "next/image";
import { PackageDialog } from "./PackageDialog";

interface PackageCardProps {
  package: Package;
  onEdit: (packageData: Omit<Package, "id">) => void;
  onDelete: (id: string) => void;
}

export function PackageCard({ package: pkg, onEdit, onDelete }: PackageCardProps) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`)) {
      onDelete(pkg.id);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={pkg.image || "/placeholder-image.jpg"}
            alt={pkg.name}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{pkg.name}</CardTitle>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {pkg.description}
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold">${pkg.price}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{pkg.duration}h</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <PackageDialog
          package={pkg}
          onSave={onEdit}
          trigger={
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          }
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="flex-1"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
