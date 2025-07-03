"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { shareableLinkWithServiceSchema } from "@/features/individual-event/schemas/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const VIDEO_PROVIDERS = [
  { label: "Zoom", value: "ZOOM" },
  { label: "Google Meet", value: "GOOGLE_MEET" },
  { label: "Webex", value: "WEBEX" },
  { label: "Microsoft Teams", value: "MICROSOFT_TEAMS" },
  { label: "GoTo Meeting", value: "GOTO_MEETING" },
];

const EVENT_TYPES = [
  { label: "One-to-One Meeting", value: "ONE_TO_ONE" },
  { label: "General Meeting", value: "GENERAL" },
];

const LINK_TYPES = [
  { label: "Single Slot", value: "SINGLE_SLOT" },
  { label: "Daily Slots", value: "DAILY_SLOTS" },
  { label: "Multi-Day Slots", value: "MULTI_DAY_SLOTS" },
];

const DAYS_OF_WEEK = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
];

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Availability = {
  weekDay: string;
  timeSlots: { startTime: string; endTime: string }[];
};

export default function EventFormPage() {
  const router = useRouter();
  const userId = "cmben86we0000vd8gk890533p";
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    slug: "",
    type: "",
    linkType: "",
    estimatedDuration: 60,
    status: "ACTIVE",
    metaTitle: "",
    metaDescription: "",
    date: "",
    dateRangeEnd: "",
    expiresAt: "",
    serviceAvailability: [
      { weekDay: "", timeSlots: [{ startTime: "", endTime: "" }] } as Availability,
    ],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    if (name === "title") {
      updatedForm.slug = slugify(value);
    }
    setForm(updatedForm);
  };

  const handleAvailabilityChange = (
    idx: number,
    field: "weekDay",
    value: string
  ) => {
    const updated = [...form.serviceAvailability];
    updated[idx][field] = value;
    setForm({ ...form, serviceAvailability: updated });
  };

  const handleTimeSlotChange = (
    availIdx: number,
    slotIdx: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updated = [...form.serviceAvailability];
    updated[availIdx].timeSlots[slotIdx][field] = value;
    setForm({ ...form, serviceAvailability: updated });
  };

  const addAvailability = () => {
    setForm({
      ...form,
      serviceAvailability: [
        ...form.serviceAvailability,
        { weekDay: "", timeSlots: [{ startTime: "", endTime: "" }] },
      ],
    });
  };

  const removeAvailability = (idx: number) => {
    setForm({
      ...form,
      serviceAvailability: form.serviceAvailability.filter((_, i) => i !== idx),
    });
  };

  const addTimeSlot = (availIdx: number) => {
    const updated = [...form.serviceAvailability];
    updated[availIdx].timeSlots.push({ startTime: "", endTime: "" });
    setForm({ ...form, serviceAvailability: updated });
  };

  const removeTimeSlot = (availIdx: number, slotIdx: number) => {
    const updated = [...form.serviceAvailability];
    updated[availIdx].timeSlots = updated[availIdx].timeSlots.filter((_, i) => i !== slotIdx);
    setForm({ ...form, serviceAvailability: updated });
  };

  // FIX: Always set linkType to SINGLE_SLOT for ONE_TO_ONE, else let user choose
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      type: value,
      linkType: value === "ONE_TO_ONE" ? "SINGLE_SLOT" : "",
      serviceAvailability: value === "ONE_TO_ONE"
        ? [{ weekDay: "", timeSlots: [{ startTime: "", endTime: "" }] }]
        : prev.serviceAvailability,
      date: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Ensure type and linkType are always present and valid
    const payload = {
      slug: form.slug,
      location: form.location,
      type: form.type, // Always present
      linkType: form.type === "ONE_TO_ONE" ? "SINGLE_SLOT" : form.linkType, // Always valid
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      date: form.type === "ONE_TO_ONE" ? form.date : undefined,
      dateRangeEnd: form.dateRangeEnd || undefined,
      expiresAt: form.expiresAt || undefined,
      userId,
      service: {
        title: form.title,
        description: form.description,
        type: "VIRTUAL",
        estimatedDuration: Number(form.estimatedDuration),
        status: form.status,
        serviceAvailability: form.type === "ONE_TO_ONE"
          ? undefined
          : form.serviceAvailability.map((avail) => ({
              weekDay: avail.weekDay,
              timeSlots: avail.timeSlots.map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
              })),
            })),
      },
    };

    try {
      shareableLinkWithServiceSchema.parse(payload);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/individual-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to create event");
      }
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-400">
            Create New Event
          </CardTitle>
          <CardDescription>
            Fill in the details to create your event. For one-to-one meetings, only a single date/time is allowed.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Event title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Event description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Video Provider</Label>
              <select
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className="block w-full border rounded px-3 py-2"
              >
                <option value="">Select provider</option>
                {VIDEO_PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Event Type</Label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleTypeChange}
                required
                className="block w-full border rounded px-3 py-2"
              >
                <option value="">Select event type</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Only show linkType dropdown for non-one-to-one types */}
          {/*   {form.type !== "ONE_TO_ONE" && (
              <div className="space-y-1.5">
                <Label htmlFor="linkType">Link Type</Label>
                <select
                  id="linkType"
                  name="linkType"
                  value={form.linkType}
                  onChange={handleChange}
                  required
                  className="block w-full border rounded px-3 py-2"
                >
                  <option value="">Select link type</option>
                  {LINK_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )} */}
            {form.type === "ONE_TO_ONE" ? (
              <div className="space-y-1.5">
                <Label htmlFor="date">Date & Time (for one-to-one)</Label>
                <Input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Availability</Label>
                {form.serviceAvailability.map((avail, availIdx) => (
                  <div key={availIdx} className="border rounded p-3 mb-2 bg-slate-50 dark:bg-slate-800">
                    <div className="flex gap-2 items-center mb-2">
                      <select
                        name="weekDay"
                        value={avail.weekDay}
                        onChange={(e) => handleAvailabilityChange(availIdx, "weekDay", e.target.value)}
                        className="border rounded px-2 py-1"
                        required
                      >
                        <option value="">Day</option>
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      {avail.timeSlots.map((slot, slotIdx) => (
                        <React.Fragment key={slotIdx}>
                          <Input
                            type="time"
                            name="startTime"
                            value={slot.startTime}
                            onChange={e => handleTimeSlotChange(availIdx, slotIdx, "startTime", e.target.value)}
                            required
                          />
                          <Input
                            type="time"
                            name="endTime"
                            value={slot.endTime}
                            onChange={e => handleTimeSlotChange(availIdx, slotIdx, "endTime", e.target.value)}
                            required
                          />
                          {avail.timeSlots.length > 1 && (
                            <Button type="button" variant="destructive" onClick={() => removeTimeSlot(availIdx, slotIdx)}>
                              Remove Slot
                            </Button>
                          )}
                        </React.Fragment>
                      ))}
                      <Button type="button" variant="outline" onClick={() => addTimeSlot(availIdx)}>
                        Add Time Slot
                      </Button>
                    </div>
                    <Button type="button" variant="destructive" onClick={() => removeAvailability(availIdx)}>
                      Remove Availability
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addAvailability}>
                  Add Availability
                </Button>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="estimatedDuration">Estimated Duration (min)</Label>
              <Input
                id="estimatedDuration"
                name="estimatedDuration"
                type="number"
                min={1}
                value={form.estimatedDuration}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </CardFooter>
          {error && (
            <div className="text-sm font-medium text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-300 dark:border-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm font-medium text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-300 dark:border-green-700">
              Event created! Redirecting...
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
