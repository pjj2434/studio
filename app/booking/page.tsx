// app/booking/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO, isAfter, isToday, startOfDay } from 'date-fns';

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Package {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  availabilityId: string;
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch availability and packages data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        console.log('🔄 Fetching booking data...');
        
        const [availabilityResponse, packagesResponse, bookingsResponse] = await Promise.all([
          fetch('/api/availability'),
          fetch('/api/packages'),
          fetch('/api/bookings')
        ]);

        if (!availabilityResponse.ok) {
          throw new Error(`Failed to fetch availability: ${availabilityResponse.status}`);
        }

        if (!packagesResponse.ok) {
          throw new Error(`Failed to fetch packages: ${packagesResponse.status}`);
        }

        if (!bookingsResponse.ok) {
          throw new Error(`Failed to fetch bookings: ${bookingsResponse.status}`);
        }

        const availabilityData = await availabilityResponse.json();
        const packagesData = await packagesResponse.json();
        const bookingsData = await bookingsResponse.json();

        setAvailability(availabilityData);
        setPackages(packagesData);
        setBookings(bookingsData);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load booking data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get selected package details
  const selectedPackage = packages.find(pkg => pkg.id === packageId);

  // Generate time slots based on package duration
  const generateTimeSlots = (startTime: string, endTime: string, durationHours: number, availabilityId: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = durationHours * 60;

    for (let currentStart = startMinutes; currentStart + durationMinutes <= endMinutes; currentStart += 60) {
      const currentEnd = currentStart + durationMinutes;
      
      if (currentEnd <= endMinutes) {
        slots.push({
          startTime: minutesToTime(currentStart),
          endTime: minutesToTime(currentEnd),
          availabilityId
        });
      }
    }

    return slots;
  };

  // Get available dates
  const availableDates = [...new Set(
    availability
      .filter(slot => {
        if (!slot.isActive) return false;
        
        try {
          const slotDate = parseISO(slot.date);
          const today = startOfDay(new Date());
          return isAfter(slotDate, today) || isToday(slotDate);
        } catch (error) {
          console.error('Date parsing error:', error);
          return false;
        }
      })
      .map(slot => slot.date)
  )];

  // Get available time slots for selected date, filtering out booked slots
  const availableTimeSlots = selectedDate && selectedPackage
    ? availability
        .filter(slot => 
          slot.isActive && 
          slot.date === format(selectedDate, 'yyyy-MM-dd')
        )
        .flatMap(slot => generateTimeSlots(slot.startTime, slot.endTime, selectedPackage.duration, slot.id))
        .filter(slot => {
          // Exclude slots that overlap with an approved booking
          return !bookings.some(booking => {
            if (booking.date !== format(selectedDate, 'yyyy-MM-dd')) return false;
            if (booking.status !== 'approved') return false;
            // Check for time overlap
            const timeToMinutes = (time: string) => {
              const [h, m] = time.split(':').map(Number);
              return h * 60 + m;
            };
            const slotStart = timeToMinutes(slot.startTime);
            const slotEnd = timeToMinutes(slot.endTime);
            const bookingStart = timeToMinutes(booking.startTime);
            const bookingEnd = timeToMinutes(booking.endTime);
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot || !selectedPackage) {
      setError('Please select both date and time');
      return;
    }

    // Validate form data
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const bookingData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        packageId,
        availabilityId: selectedTimeSlot.availabilityId,
        duration: selectedPackage.duration
      };

      console.log('📤 Submitting booking:', bookingData);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      console.log('✅ Booking submitted successfully:', result);

      setSuccess(result.message || 'Booking request submitted successfully! Check your email for confirmation.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setSelectedDate(undefined);
      setSelectedTimeSlot(null);

      // Redirect after a delay
      setTimeout(() => {
        router.push('/?success=booking-submitted');
      }, 3000);

    } catch (error) {
      console.error('❌ Booking submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit booking request';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setError(null);
  };

  // Handle time slot selection with better mobile support
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setSelectedTimeSlot(slot);
    setError(null);
  };

  // Check if two time slots are the same
  const isSlotSelected = (slot: TimeSlot) => {
    return selectedTimeSlot?.startTime === slot.startTime && 
           selectedTimeSlot?.endTime === slot.endTime &&
           selectedTimeSlot?.availabilityId === slot.availabilityId;
  };

  // Format time from 24h to 12h format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return availableDates.includes(dateString);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking information...</p>
        </div>
      </main>
    );
  }

  if (error && !selectedPackage) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Unable to Load Booking</h1>
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </main>
    );
  }

  if (!selectedPackage) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
          <p className="text-muted-foreground mb-4">The selected package could not be found.</p>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-start lg:items-center justify-center p-4 py-8">
        <div className="bg-card/95 backdrop-blur-md rounded-lg shadow-xl w-full max-w-6xl border border-black/20">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-black/20">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-card-foreground">Book Your Package</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {selectedPackage.name} - {selectedPackage.duration} hour{selectedPackage.duration > 1 ? 's' : ''} - ${selectedPackage.price}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Calendar and Time Slots Section */}
              <div className="space-y-6">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select Date</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      Available dates ({availableDates.length})
                    </span>
                  </div>
                  
                  {availableDates.length === 0 && (
                    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-yellow-800">
                        No available dates found. Please check back later or contact us directly.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Calendar Container with proper sizing */}
                  <div className="flex justify-center lg:justify-start">
                    <div className="w-full max-w-sm">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          const isPast = date < startOfDay(new Date());
                          const isAvailable = isDateAvailable(date);
                          return isPast || !isAvailable;
                        }}
                        className="rounded-md border border-border bg-card/50 w-full"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4 w-full",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex w-full",
                          head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-8 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible",
                        }}
                        modifiers={{
                          available: (date) => isDateAvailable(date)
                        }}
                        modifiersStyles={{
                          available: { 
                            backgroundColor: 'rgb(34 197 94 / 0.1)', 
                            color: 'rgb(34 197 94)',
                            fontWeight: 'bold'
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Available Times
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedPackage.duration} hour session{selectedPackage.duration > 1 ? 's' : ''} • ${selectedPackage.price}
                    </p>
                    
                    {availableTimeSlots.length > 0 ? (
                      <div className="space-y-3">
                        {/* Selected time slot indicator */}
                        {selectedTimeSlot && (
                          <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-800">
                                Selected: {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Time slot buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                          {availableTimeSlots.map((slot, index) => {
                            const isSelected = isSlotSelected(slot);
                            return (
                              <button
                                key={`${slot.availabilityId}-${index}`}
                                onClick={() => handleTimeSlotSelect(slot)}
                                className={`
                                  p-4 rounded-lg border-2 transition-all duration-200 touch-manipulation
                                  ${isSelected 
                                    ? 'bg-green-600 border-green-600 text-white shadow-lg transform scale-105' 
                                    : 'bg-white border-gray-200 text-gray-900 hover:border-green-300 hover:bg-green-50 active:bg-green-100'
                                  }
                                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                                  min-h-[60px] flex items-center justify-center
                                `}
                                type="button"
                              >
                                <div className="text-center">
                                  <div className={`font-semibold text-base ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </div>
                                  <div className={`text-xs mt-1 ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                                    {selectedPackage.duration}h • ${selectedPackage.price}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          No available time slots for this date. Need {selectedPackage.duration} consecutive hours available.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              {/* Form Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Your Information</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-3 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-base"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-base"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      className="w-full px-3 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-base"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                      Additional Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Any special requirements or questions..."
                      className="w-full px-3 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none text-base"
                      disabled={submitting}
                    />
                  </div>

                  {/* Booking Summary */}
                  {selectedDate && selectedTimeSlot && (
                    <div className="bg-muted/50 p-4 rounded-md border border-border">
                      <h4 className="font-medium text-foreground mb-2">Booking Summary</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                            {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{selectedPackage.name}</p>
                          <p className="font-medium text-lg">${selectedPackage.price}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!selectedDate || !selectedTimeSlot || submitting}
                    className="w-full py-3 text-base font-medium touch-manipulation"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Booking Request'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
