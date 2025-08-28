// app/admin/packages/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Package } from "@/types";
import { PackageDialog } from "../__components/PackageDialog";
import { PackageCard } from "../__components/packagecard";

export default function PackagesAdminPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPackage = async (packageData: Omit<Package, "id">) => {
    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData),
      });

      if (response.ok) {
        const newPackage = await response.json();
        setPackages([...packages, newPackage]);
      } else {
        alert('Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Error creating package');
    }
  };

  const handleEditPackage = (id: string) => async (packageData: Omit<Package, "id">) => {
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData),
      });

      if (response.ok) {
        const updatedPackage = await response.json();
        setPackages(packages.map(pkg => 
          pkg.id === id ? updatedPackage : pkg
        ));
      } else {
        alert('Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Error updating package');
    }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPackages(packages.filter(pkg => pkg.id !== id));
      } else {
        alert('Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Error deleting package');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Package Management</h1>
        <p className="text-muted-foreground">
          Manage your service packages, pricing, and availability.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <PackageDialog onSave={handleAddPackage} />
      </div>

      {filteredPackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No packages found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first package."}
          </p>
          {!searchTerm && (
            <PackageDialog onSave={handleAddPackage} />
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onEdit={handleEditPackage(pkg.id)}
              onDelete={handleDeletePackage}
            />
          ))}
        </div>
      )}
    </>
  );
}
