"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Convert 24-hour time to 12-hour EST format
const formatTimeToEST = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

// Convert 12-hour EST format back to 24-hour
const formatTimeTo24Hour = (time12: string): string => {
  if (!time12) return "";
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time12;
  
  let [_, hours, minutes, ampm] = match;
  let hour = parseInt(hours);
  
  if (ampm.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  } else if (ampm.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, "0")}:${minutes}`;
};

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  disabled = false,
}: TimePickerProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Try to parse as 12-hour format first, then 24-hour
    const time24 = formatTimeTo24Hour(newValue);
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time24)) {
      onChange(time24);
    }
  };

  const handleInputBlur = () => {
    // If input is invalid, revert to previous value
    const time24 = formatTimeTo24Hour(inputValue);
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time24)) {
      setInputValue(value);
    }
  };

  const quickTimes = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM","08:30 PM","09:00 PM"
  ];

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          value={inputValue ? formatTimeToEST(inputValue) : ""}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="HH:MM AM/PM"
          className="w-28 text-center"
          disabled={disabled}
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={disabled}
            >
              <Clock className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Quick Select (EST)</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {quickTimes.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const time24 = formatTimeTo24Hour(time);
                        onChange(time24);
                        setInputValue(time24);
                        setIsOpen(false);
                      }}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                
                <div className="flex items-center space-x-2 mt-2">
                  
                
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
