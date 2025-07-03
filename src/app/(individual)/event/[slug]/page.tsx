"use client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShareableLink } from "@/features/individual-event/types/types";

// Helper: Prisma WeekDays enum to JS Date.getDay()
const weekDayEnumToIndex = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export default function BookingPage() {
  const { slug } = useParams();
  const [link, setLink] = useState<ShareableLink | null>(null); // ShareableLink object
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function fetchLink() {
      setLoading(true);
      try {
        const res = await fetch(`/api/individual-event/book-event/${slug}`);
        const data = await res.json();
        console.log("data is", data);
        setLink(data.data); // ShareableLink object from backend
      } catch (e) {
        setLink(null);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchLink();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!link) return <div>Event not found</div>;

  const service = link.service;
  const provider = service?.individual;
  const availability = service?.serviceAvailability ?? [];

  // Prepare available dates for the calendar
  function getAvailableDates(availability) {
    const result = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const endDate = new Date(year, month + 1, 1);

    for (
      let d = new Date(year, month, today.getDate());
      d < endDate;
      d.setDate(d.getDate() + 1)
    ) {
      for (const slot of availability) {
        if (d.getDay() === weekDayEnumToIndex[slot.weekDay]) {
          result.push(new Date(d));
          break;
        }
      }
    }
    return result;
  }

  function getTimeSlotsForDate(date, availability) {
    const dayIndex = date.getDay();
    return availability
      .filter((a) => weekDayEnumToIndex[a.weekDay] === dayIndex)
      .flatMap((a) => a.timeSlots);
  }

  const availableDates = getAvailableDates(availability);
  const slotsForSelectedDate = selectedDate
    ? getTimeSlotsForDate(selectedDate, availability)
    : [];
  const isDateAvailable =
    selectedDate &&
    availableDates.some(
      (d) =>
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
    );

  const handleTimeClick = (slot) => {
    setSelectedTime(slot);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!link || !selectedDate || !selectedTime) return;

    // Find the slot object for the selected time
    const slot = slotsForSelectedDate.find(
      (s) => `${s.startTime} - ${s.endTime}` === selectedTime
    );
    if (!slot) return;

    const [hour, minute] = slot.startTime.split(":").map(Number);
    const timeSlot = new Date(selectedDate);
    timeSlot.setHours(hour, minute, 0, 0);

    const startTimeISO = timeSlot.toISOString();

    // Calculate endTime by adding duration (in minutes)
    const endTimeDate = new Date(
      timeSlot.getTime() + (service?.estimatedDuration ?? 30) * 60000
    );
    const endTimeISO = endTimeDate.toISOString();

    // Prepare the payload, always include type property
    const payload = {
       serviceId: service?.id,   
      startTime: startTimeISO, // required
      endTime: endTimeISO,
      timeSlot: timeSlot.toISOString(),
      duration: service?.estimatedDuration,
      bookedByEmail: email,
      bookedByName: name,
      bookerPhone: phone,
      comment,
      slug: link.slug,  
    };

    try {
      const response = await fetch("/api/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Meeting booked successfully!");
        setShowForm(false);
        setSelectedTime(null);
        setEmail("");
        setComment("");
      } else {
        alert(data.error || "Failed to book meeting");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 justify-center">
        {/* Left: Provider Info */}
        <Card className="shadow-lg border border-gray-200 bg-white rounded-xl w-full max-w-xs md:w-[320px]">
          <CardHeader className="flex flex-col items-center gap-2">
            <Link
              href={`/profile/${provider?.id}`}
              className="hover:underline w-full flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                {provider?.profileImage && (
                  <img
                    src={provider.profileImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
              </div>
              <div className="font-semibold text-lg">
                {provider?.user?.name}
              </div>
              <div className="text-md text-center text-gray-500">
                {provider?.position}
              </div>
            </Link>
            <div className="text-2xl font-bold text-center">
              {service?.title}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 text-gray-500 mt-2">
              <div className="flex items-center gap-2">
                <span className="material-icons text-base">schedule</span>
                <span className="font-medium">
                  {service?.estimatedDuration} min
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons text-base">videocam</span>
                <span className="font-medium">{link.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons text-base">event</span>
                <span className="font-medium">{link.type}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 w-full">
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>

        {/* Center: Calendar */}
        <div className="w-full max-w-md md:w-[340px] flex flex-col items-center bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="mb-2 font-semibold text-lg text-center">
            Select a Date &amp; Time
          </div>
          <Calendar
            mode="single"
            required
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border shadow w-full"
            classNames={{
              months: "flex flex-row gap-2 w-full justify-center",
              month: "flex flex-col gap-2 w-full",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell:
                "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm w-10 h-10",
              day: "w-10 h-10 p-0 font-normal aria-selected:opacity-100",
            }}
            modifiers={{
              available: availableDates,
            }}
            modifiersClassNames={{
              available: "bg-blue-100 text-blue-700",
            }}
          />
          <div className="mt-4 text-sm text-gray-500 flex items-center gap-1">
            <span>
              Time zone:{" "}
              <span className="font-medium">{provider?.timezone || "UTC"}</span>
            </span>
          </div>
        </div>

        {/* Right: Time Slots */}
        <div className="w-full max-w-xs md:w-[320px] flex flex-col items-center bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="mb-4 text-lg font-semibold text-center">
            {!selectedDate
              ? "Select a date to book your meeting"
              : selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
          </div>
          {showForm ? (
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-3 w-full"
            >
              <div>
                <strong>Selected Time:</strong> {selectedTime}
              </div>
              <div>
                <div>
                  <label className="block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <label className="block mb-1">Email:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Phone:</label>
                <input
                  type="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label className="block mb-1">Comment:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 text-white">
                Book meeting
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowForm(false)}
              >
                Back
              </Button>
            </form>
          ) : !selectedDate ? (
            <div className="text-gray-500 text-center">
              Select a date to book your meeting
            </div>
          ) : isDateAvailable && slotsForSelectedDate.length > 0 ? (
            <div className="flex flex-col gap-3 w-full">
              {slotsForSelectedDate.map((slot, idx) => (
                <Button
                  key={idx}
                  onClick={() =>
                    handleTimeClick(`${slot.startTime} - ${slot.endTime}`)
                  }
                  className="w-full"
                >
                  {slot.startTime} - {slot.endTime} (
                  {service?.estimatedDuration} min)
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">
              No meetings for this date
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
