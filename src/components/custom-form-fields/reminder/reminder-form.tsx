"use client";

import { useForm, FormProvider } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import InputField from "@/components/custom-form-fields/input-field";
import TextAreaField from "@/components/custom-form-fields/textarea-field";
import ReminderSelectField from "./select-field";
import CheckboxGroupField from "./checbox-group-field";
import RadioGroupField from "./radio-group-field";
import {
  AudioWaveform,
  BetweenHorizonalStart,
  PenLine,
  Send,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useServiceStore } from "@/app/admin/service/_store/service-store";
import ScheduleField from "./modified-schedule-field";
import {
  createReminder,
  getReminderById,
  updateReminder,
} from "@/features/reminder/api/api";
import dayjs from "dayjs";
import { set } from "lodash";

// Define reminder types for frontend
const reminderTypes = [
  "Upcoming",
  "Follow-up",
  "Cancellation",
  "Missed",
  "Custom",
];

// Map frontend reminder types to backend ReminderType enum
const frontendToBackendType: Record<string, string> = {
  Upcoming: "REMINDER",
  "Follow-up": "FOLLOW_UP",
  Cancellation: "CANCELLATION",
  Missed: "MISSED",
  Custom: "CUSTOM",
};

// Map backend ReminderType enum to frontend reminder types
const backendToFrontendType: Record<string, string> = {
  REMINDER: "Upcoming",
  FOLLOW_UP: "Follow-up",
  CANCELLATION: "Cancellation",
  MISSED: "Missed",
  CUSTOM: "Custom",
};

// Define when options for each reminder type
const whenOptions: Record<string, string[]> = {
  Upcoming: [
    "48 hours before appointment",
    "24 hours before appointment",
    "1 hours before appointment",
  ],
  "Follow-up": [
    "1 hour after appointment",
    "1 days after appointment",
    "2 days after appointment",
  ],
  Missed: [
    "15 minutes after missed",
    "1 hour after missed",
    "24 hours after missed",
    "48 hours after missed",
  ],
  Cancellation: [
    "15 minutes after cancellation",
    "1 hour after cancellation",
    "24 hours after cancellation",
    "48 hours after cancellation",
  ],
  Custom: [],
};

// Define schedule labels for each reminder type
const scheduleLabels = {
  Upcoming: "Schedule reminder",
  "Follow-up": "Schedule follow-up",
  Missed: "Schedule follow-up",
  Cancellation: "Schedule follow-up",
  Custom: "Schedule reminder",
};

// Define send via and auto-delete options
const sendViaOptions = ["Email", "SMS", "Push Notification"];
const autoDeleteOptions = ["7 days", "30 days", "Never"];

// Default messages for each reminder type
const defaultMessages: Record<string, string> = {
  "Follow-up":
    "Thank you for visiting us on {selected_appointment_date} for {selected_service_name}. We value your feedback! Please take a moment to share your experience.",
  Upcoming:
    "You have an appointment scheduled on {selected_appointment_date} at {selected_appointment_time} for {selected_service_name}. Please be on time. If you need to reschedule, visit your dashboard.",
  Missed:
    "It looks like you missed your appointment on {selected_appointment_date}. Please contact us if you'd like to reschedule.",
  Cancellation:
    "Your appointment on {selected_appointment_date} was cancelled. Let us know if you'd like to rebook.",
  Custom: "Custom reminder for your appointment. Please check your schedule.",
  Default: "Reminder for your appointment. Please check your schedule.",
};

// Convert when option to minutes
const getOffsetFromWhen = (option: string): number => {
  const match = option.match(/^(\d+)\s*(minute|hour|day)s?/i);
  if (!match) {
    return option === "Same day after appointment" ? 0 : 0;
  }
  const [_, value, unit] = match;
  const numValue = parseInt(value);
  switch (unit.toLowerCase()) {
    case "minute":
      return numValue;
    case "hour":
      return numValue * 60;
    case "day":
      return numValue * 24 * 60;
    default:
      return 0;
  }
};

// Convert offset to when option
const getWhenFromOffset = (offset: number, type: string): string | null => {
  const options = whenOptions[type] || [];
  for (const option of options) {
    if (getOffsetFromWhen(option) === offset) {
      return option;
    }
  }
  return null;
};

// Convert offset to days, hours, minutes
const offsetToSchedule = (offset: number) => {
  const days = Math.floor(offset / (24 * 60));
  offset %= 24 * 60;
  const hours = Math.floor(offset / 60);
  const minutes = offset % 60;
  return {
    scheduleDays: days > 0 ? days.toString() : "",
    scheduleHours: hours > 0 ? hours.toString() : "",
    scheduleMinutes: minutes > 0 ? minutes.toString() : "",
  };
};

interface FormData {
  type: string;
  subject: string;
  description: string;
  message: string;
  service: string;
  when: string[];
  isScheduled: boolean;
  scheduleDays: string;
  scheduleHours: string;
  scheduleMinutes: string;
  scheduleDate: string | null;
  scheduleTime: string;
  notifications: string[];
  autoDelete: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: string;
  estimatedDuration: number;
  updatedAt: string;
  businessDetailId: string | null;
}

interface TransformedData {
  id?: string;
  type: string;
  title: string;
  description?: string;
  message?: string;
  services: string[];
  notifications: { method: string }[];
  reminderOffset: Array<{
    sendOffset?: number;
    scheduledAt?: string;
    sendBefore: boolean;
  }>;
}

const transformData = (data: FormData): TransformedData => {
  const isBefore = data.type === "Upcoming" || data.type === "Custom";
  const reminderOffset: Array<{
    sendOffset?: number;
    scheduledAt?: string;
    sendBefore: boolean;
  }> = [];

  if (data.type !== "Custom") {
    const whenOffsets = data.when
      .filter((option: string) => !option.toLowerCase().includes("schedule"))
      .map((option: string) => ({
        sendOffset: getOffsetFromWhen(option),
        sendBefore: isBefore,
      }));

    if (
      data.isScheduled &&
      (data.scheduleDays || data.scheduleHours || data.scheduleMinutes)
    ) {
      const days = parseInt(data.scheduleDays || "0");
      const hours = parseInt(data.scheduleHours || "0");
      const minutes = parseInt(data.scheduleMinutes || "0");
      const offset = days * 24 * 60 + hours * 60 + minutes;
      if (offset > 0) {
        whenOffsets.push({
          sendOffset: offset,
          sendBefore: isBefore,
        });
      }
    }
    reminderOffset.push(...whenOffsets);
  }

  if (
    data.isScheduled &&
    data.type === "Custom" &&
    data.scheduleDate &&
    data.scheduleTime
  ) {
    const dateTime = new Date(
      `${data.scheduleDate.split("T")[0]}T${data.scheduleTime}:00.000Z`
    );
    reminderOffset.push({
      scheduledAt: dateTime.toISOString(),
      sendBefore: isBefore,
    });
  }

  const uniqueNotifications = Array.from(new Set(data.notifications)).map(
    (method: string) => ({
      method: method === "Push Notification" ? "PUSH" : method.toUpperCase(),
    })
  );

  return {
    type: frontendToBackendType[data.type] || "REMINDER",
    title: data.subject,
    description: data.description || undefined,
    message: data.message || undefined,
    services: data.service ? [data.service] : [],
    notifications: uniqueNotifications,
    reminderOffset,
  };
};

const reverseTransformData = (
  data: TransformedData & { id?: string; services: Service[] }
): FormData => {
  const frontendType = backendToFrontendType[data.type] || "Upcoming";
  const when: string[] = [];
  let isScheduled = false;
  let scheduleDays = "";
  let scheduleHours = "";
  let scheduleMinutes = "";
  let scheduleDate: string | null = null;
  let scheduleTime = "";

  if (frontendType !== "Custom") {
    data.reminderOffset.forEach((offset) => {
      if (offset.sendOffset) {
        const whenOption = getWhenFromOffset(offset.sendOffset, frontendType);
        if (whenOption) {
          when.push(whenOption);
        } else {
          isScheduled = true;
          const schedule = offsetToSchedule(offset.sendOffset);
          scheduleDays = schedule.scheduleDays;
          scheduleHours = schedule.scheduleHours;
          scheduleMinutes = schedule.scheduleMinutes;
        }
      }
    });
  } else {
    const customOffset = data.reminderOffset.find((r) => r.scheduledAt);
    if (customOffset?.scheduledAt) {
      isScheduled = true;
      const date = new Date(customOffset.scheduledAt);
      scheduleDate = date.toISOString();
      scheduleTime = date.toTimeString().slice(0, 5);
    }
  }

  const notifications = data.notifications.map((n) => {
    switch (n.method) {
      case "EMAIL":
        return "Email";
      case "SMS":
        return "SMS";
      case "PUSH":
        return "Push Notification";
      default:
        return n.method;
    }
  });

  return {
    type: frontendType,
    subject: data.title,
    description: data.description || "",
    message:
      data.message ||
      defaultMessages[frontendType] ||
      defaultMessages["Default"],
    service: data.services[0]?.id || "",
    when,
    isScheduled,
    scheduleDays,
    scheduleHours,
    scheduleMinutes,
    scheduleDate,
    scheduleTime,
    notifications,
    autoDelete: "7 days",
  };
};

export default function ReminderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { serviceOptions, services, fetchServices, loading, hasFetched } =
    useServiceStore();
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const reminderId = params.id as string;

  const form = useForm<FormData>({
    defaultValues: {
      type: "Upcoming",
      subject: "",
      description: "",
      message: defaultMessages["Upcoming"],
      service: "",
      when: [],
      isScheduled: false,
      scheduleDays: "",
      scheduleHours: "",
      scheduleMinutes: "",
      scheduleDate: null,
      scheduleTime: "",
      notifications: [...sendViaOptions],
      autoDelete: "7 days",
    },
  });

  const { watch, setValue, handleSubmit, setError: setFormError, reset } = form;
  const selectedType = watch("type") || "Upcoming";
  const selectedService = watch("service");

  // Fetch reminder data for edit mode
  useEffect(() => {
    if (reminderId) {
      const fetchReminder = async () => {
        try {
          const reminder = await getReminderById(reminderId);
          console.log("Fetched reminder by Id:", reminder);
          const formData = reverseTransformData(reminder);
          reset(formData);
        } catch (err) {
          console.error("Failed to fetch reminder:", err);
          setError("Failed to load reminder. Please try again.");
        }
      };
      fetchReminder();
    }
  }, [reminderId, reset]);

  // Fetch services if not already fetched
  useEffect(() => {
    console.log(
      "ReminderForm: Checking fetch, loading =",
      loading,
      "hasFetched =",
      hasFetched
    );
    if (!loading && !hasFetched) {
      console.log("ReminderForm: Triggering fetchServices");
      fetchServices();
    }
  }, [fetchServices, loading, hasFetched]);

  // Debug services and serviceOptions
  useEffect(() => {
    console.log("ReminderForm: services =", services);
    console.log("ReminderForm: serviceOptions =", serviceOptions);
  }, [services, serviceOptions]);

  // Debug selectedType and selectedService
  useEffect(() => {
    console.log(
      "ReminderForm: selectedType =",
      selectedType,
      typeof selectedType
    );
    console.log("ReminderForm: selectedService =", selectedService);
  }, [selectedType, selectedService]);

  // Update message based on selected type
  useEffect(() => {
    setValue(
      "message",
      defaultMessages[selectedType] || defaultMessages["Default"]
    );
  }, [selectedType, setValue]);

  const onSubmit = async (data: FormData) => {
    console.log("onSubmit: raw data =", data);

    // Validate service selection
    if (!data.service) {
      setFormError("service", {
        type: "manual",
        message: "Please select a service",
      });
      setError("Please select a service");
      return;
    }

    // Validate reminderOffset
    if (data.type !== "Custom" && data.when.length === 0 && !data.isScheduled) {
      setError(
        "Please select at least one 'When to send' option or enable scheduling"
      );
      return;
    }
    if (
      data.type === "Custom" &&
      data.isScheduled &&
      (!data.scheduleDate || !data.scheduleTime)
    ) {
      setError("Please provide both date and time for Custom reminder");
      return;
    }

    try {
      setIsSubmitting(true);
      const submittedData = transformData(data);
      let response;
      if (reminderId) {
        response = await updateReminder(reminderId, submittedData);
        console.log("onSubmit: update response =", response);
      } else {
        response = await createReminder(submittedData);
        console.log("onSubmit: create response =", response);
      }
      setError(null);
      router.push("/reminders");
    } catch (err) {
      console.error("Failed to save reminder:", err);
      setError("Failed to save reminder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure whenOptions[selectedType] is always an array
  const safeWhenOptions = whenOptions[selectedType] || [];

  return (
    <FormProvider {...form}>
      <Card className="p-4">
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {reminderId ? "Edit Reminder" : "Create Reminder"}
          </h2>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-6">
              {/* Reminder Type */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <BetweenHorizonalStart className="size-4 text-gray-500" />
                  <Label>Reminder Type</Label>
                </div>
                <Tabs value={selectedType} className="mt-2">
                  <TabsList className="grid gap-1 grid-cols-5">
                    {reminderTypes.map((type) => (
                      <TabsTrigger
                        key={type}
                        value={type}
                        className="text-xs"
                        disabled={reminderId && type !== selectedType}
                        onClick={() => {
                          if (!reminderId || type === selectedType) {
                            setValue("type", type);
                            setValue("when", []);
                            setValue("isScheduled", false);
                            setValue("scheduleDays", "");
                            setValue("scheduleHours", "");
                            setValue("scheduleMinutes", "");
                            setValue("scheduleDate", null);
                            setValue("scheduleTime", "");
                          }
                        }}
                      >
                        {type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedType === "Follow-up"
                    ? "📌 Follow up with users after their appointment, requesting feedback or next steps."
                    : selectedType === "Missed"
                      ? "📌 Reminder sent for missed appointments."
                      : selectedType === "Cancellation"
                        ? "📌 Notify users about cancelled appointments."
                        : selectedType === "Custom"
                          ? "📌 Create a custom reminder with flexible scheduling."
                          : "📌 Notify users about their upcoming appointments."}
                </p>
              </div>

              {/* Subject Field */}
              <InputField
                name="subject"
                label="Subject"
                placeholder="Enter subject"
                icon={PenLine}
              />

              {/* Description Field */}
              <TextAreaField
                name="description"
                label="Description"
                placeholder="Enter description"
              />

              {/* Appointment Selection */}
              {loading && !hasFetched ? (
                <div className="text-center text-muted-foreground">
                  Loading services...
                </div>
              ) : (
                <>
                  <ReminderSelectField
                    name="service"
                    label="Choose Service"
                    options={serviceOptions()}
                    placeholder="Select service to set reminder"
                    icon={SlidersHorizontal}
                    disabled={
                      loading || (!loading && serviceOptions().length === 0)
                    }
                  />
                  {!loading && hasFetched && serviceOptions().length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      No active services available.
                    </p>
                  )}
                </>
              )}

              {/* When to Send */}
              <div className=" ">
                <div className="flex gap-1">
                  <Send strokeWidth={1.5} className="size-4 text-gray-500" />
                  <Label>When to send?</Label>
                </div>
                {safeWhenOptions.length > 0 && (
                  <CheckboxGroupField
                    name="when"
                    label=""
                    options={safeWhenOptions.filter(
                      (label) => !label.toLowerCase().includes("schedule")
                    )}
                  />
                )}
                <ScheduleField
                  name="isScheduled"
                  label={scheduleLabels[selectedType] || "Schedule reminder"}
                  dayFieldName="scheduleDays"
                  hourFieldName="scheduleHours"
                  minuteFieldName="scheduleMinutes"
                  dateFieldName="scheduleDate"
                  timeFieldName="scheduleTime"
                />
              </div>

              {/* Send Via */}
              <CheckboxGroupField
                name="notifications"
                label="Send via"
                options={sendViaOptions.map((opt) => ({
                  label: opt,
                  value: opt,
                }))}
                icon={AudioWaveform}
              />

              {/* Auto Delete */}
              <RadioGroupField
                name="autoDelete"
                label="Auto-delete expired reminder after?"
                options={autoDeleteOptions}
                icon={Trash2}
                className="space-y-2"
              />

              {/* Message */}
              <TextAreaField
                name="message"
                label="Message"
                placeholder="Enter message"
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? reminderId
                    ? "Updating..."
                    : "Creating..."
                  : reminderId
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
