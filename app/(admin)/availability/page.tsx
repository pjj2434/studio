// app/(admin)/availability/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, isValid } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Plus, Edit, Trash2, X, Check, Clock, Calendar } from "lucide-react";

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

function AvailabilityAdminPage() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add new slot state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addData, setAddData] = useState<{
    date: Date | undefined;
    startTime: string;
    endTime: string;
  }>({
    date: undefined,
    startTime: "",
    endTime: "",
  });
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Availability>>({});

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/availability");
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch availability");
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      setError("Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!addData.date || !addData.startTime || !addData.endTime) {
      setError("Please fill all fields");
      return;
    }

    if (addData.startTime >= addData.endTime) {
      setError("End time must be after start time");
      return;
    }

    setAdding(true);
    setError(null);
    
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(addData.date, "yyyy-MM-dd"),
          startTime: addData.startTime,
          endTime: addData.endTime,
        }),
      });

      if (response.ok) {
        const newSlot = await response.json();
        setAvailability((prev) => [...prev, newSlot]);
        setAddData({ date: undefined, startTime: "", endTime: "" });
        setShowAddForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add availability");
      }
    } catch (error) {
      console.error("Error adding availability:", error);
      setError("Error adding availability");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (slot: Availability) => {
    setEditing(slot.id);
    setEditData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isActive: slot.isActive,
    });
  };

  const handleSave = async () => {
    if (!editing) return;

    if (!editData.date || !editData.startTime || !editData.endTime) {
      setError("Please fill all fields");
      return;
    }

    if (editData.startTime >= editData.endTime) {
      setError("End time must be after start time");
      return;
    }

    try {
      const response = await fetch(`/api/availability/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updated = await response.json();
        setAvailability((prev) =>
          prev.map((a) => (a.id === editing ? updated : a))
        );
        setEditing(null);
        setEditData({});
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      setError("Error updating availability");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this availability slot?")) {
      return;
    }

    try {
      const response = await fetch(`/api/availability/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAvailability((prev) => prev.filter((a) => a.id !== id));
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete availability");
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
      setError("Error deleting availability");
    }
  };

  const toggleActive = async (slot: Availability) => {
    try {
      const response = await fetch(`/api/availability/${slot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...slot,
          isActive: !slot.isActive,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setAvailability((prev) =>
          prev.map((a) => (a.id === slot.id ? updated : a))
        );
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, "EEE, MMM d, yyyy");
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Convert 24-hour time to 12-hour EST format for display
  const formatTimeToEST = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Availability</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
        <p className="text-muted-foreground">
          Set and edit your available times for bookings.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Add new availability slot */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Slot
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <DatePicker
                    value={addData.date}
                    onChange={(date) => setAddData((prev) => ({ ...prev, date }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <TimePicker
                    value={addData.startTime}
                    onChange={(time) => setAddData((prev) => ({ ...prev, startTime: time }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <TimePicker
                    value={addData.endTime}
                    onChange={(time) => setAddData((prev) => ({ ...prev, endTime: time }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={adding}>
                  {adding ? "Adding..." : "Add Slot"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddData({ date: undefined, startTime: "", endTime: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability list */}
      <div className="space-y-4">
        {availability.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No availability set</p>
                <p className="text-sm">Click "Add New Slot" to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          availability.map((slot) => (
            <Card key={slot.id}>
              <CardContent className="pt-6">
                {editing === slot.id ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          value={editData.date || ""}
                          onChange={(e) => setEditData((prev) => ({ ...prev, date: e.target.value }))}
                          placeholder="YYYY-MM-DD"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time</label>
                        <TimePicker
                          value={editData.startTime || ""}
                          onChange={(time) => setEditData((prev) => ({ ...prev, startTime: time }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Time</label>
                        <TimePicker
                          value={editData.endTime || ""}
                          onChange={(time) => setEditData((prev) => ({ ...prev, endTime: time }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave}>Save</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(null);
                          setEditData({});
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatDate(slot.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatTimeToEST(slot.startTime)} - {formatTimeToEST(slot.endTime)}
                        </span>
                      </div>
                      <Badge variant={slot.isActive ? "default" : "secondary"}>
                        {slot.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(slot)}
                      >
                        {slot.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(slot)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

export default AvailabilityAdminPage;
