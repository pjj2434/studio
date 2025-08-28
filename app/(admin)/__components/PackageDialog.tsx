// app/admin/__components/PackageDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { Package } from "@/types";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";

interface PackageDialogProps {
  package?: Package;
  onSave: (packageData: Omit<Package, "id">) => void;
  trigger?: React.ReactNode;
}

export function PackageDialog({ package: pkg, onSave, trigger }: PackageDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: pkg?.name || "",
    description: pkg?.description || "",
    image: pkg?.image || "",
    price: pkg?.price || 0,
    duration: pkg?.duration || 1,
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload an image");
      return;
    }
    onSave(formData);
    setOpen(false);
    if (!pkg) {
      setFormData({
        name: "",
        description: "",
        image: "",
        price: 0,
        duration: 1,
      });
    }
  };

  const durationOptions = [
    { value: 0.5, label: "30 minutes" },
    { value: 1, label: "1 hour" },
    { value: 1.5, label: "1.5 hours" },
    { value: 2, label: "2 hours" },
    { value: 2.5, label: "2.5 hours" },
    { value: 3, label: "3 hours" },
    { value: 4, label: "4 hours" },
    { value: 5, label: "5 hours" },
    { value: 6, label: "6 hours" },
    { value: 8, label: "8 hours" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            {pkg ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {pkg ? "Edit Package" : "Add Package"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{pkg ? "Edit Package" : "Add New Package"}</DialogTitle>
            <DialogDescription>
              {pkg ? "Update the package details below." : "Create a new package by filling out the form below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter package name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter package description"
                rows={3}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Package Image</Label>
              {formData.image ? (
                <div className="space-y-2">
                  <div className="relative h-32 w-full rounded-lg overflow-hidden border">
                    <Image
                      src={formData.image}
                      alt="Package preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="w-full"
                  >
                    Replace Image
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <UploadButton<OurFileRouter, "packageImageUploader">
                    endpoint="packageImageUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) {
                        setFormData({ ...formData, image: res[0].url });
                        setIsUploading(false);
                      }
                    }}
                    onUploadError={(error: Error) => {
                      alert(`ERROR! ${error.message}`);
                      setIsUploading(false);
                    }}
                    onUploadBegin={() => {
                      setIsUploading(true);
                    }}
                    appearance={{
                      button: "bg-primary text-primary-foreground hover:bg-primary/90",
                      allowedContent: "text-muted-foreground text-sm",
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration: parseFloat(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : pkg ? "Update Package" : "Create Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
