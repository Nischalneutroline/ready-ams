"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod"; // Assuming you still want Zod for type inference if not direct parsing here
import { individualSchema } from "@/features/individual/schemas/schema"; // Path to your schema
import { Experience, Individual } from "@/features/individual/types/types";
import HeadingIndividual from "@/components/individual/individual-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Your original component uses <label>, this is from shadcn
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSquare, Upload } from "lucide-react"; // Icon for the heading
import FileUploadField from "@/components/custom-form-fields/image-upload";


export default function ProfileForm() {
  type ProfileFormState = Omit<
    Individual,
    | "id"
    | "userId"
    | "createdAt"
    | "updatedAt"
    | "user"
    | "services"
    | "videoIntegrations"
    | "address"
    | "experiences"
  > & {
    id?: string;
    experiences: ExperienceForm[];
  };

  type ExperienceForm = Omit<
    Experience,
    "id" | "individualId" | "individual" | "createdAt" | "updatedAt"
  >;

  const [form, setForm] = useState<ProfileFormState>({
    // Using the explicit interface
    bio: "",
    position: "",
    profileImage: "",
    country: "",
    timezone: "UTC", // Default to UTC,
    company: "",
    website: "",
    linkedinUrl: "",
    experiences: [],
  });

  const initialExperience: ExperienceForm = {
    company: "",
    role: "",
    description: "",
    startDate: null,
    endDate: null,
    isCertification: false,
  };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<"created" | "updated" | false>(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Experience field change handler
  const handleExperienceChange = <K extends keyof ExperienceForm>(
    idx: number,
    field: K,
    value: ExperienceForm[K]
  ) => {
    const updated = [...(form.experiences ?? [])];
    updated[idx][field] = value;
    setForm((f) => ({ ...f, experiences: updated }));
  };

  // Add a new experience
  const addExperience = () => {
    setForm((f) => ({
      ...f,
      experiences: [...(f.experiences ?? []), { ...initialExperience }],
    }));
  };
  // Remove an experience
  const removeExperience = (idx: number) => {
    setForm((f) => ({
      ...f,
      experiences: (f.experiences ?? []).filter((_, i) => i !== idx),
    }));
  };

  useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(timer);
  }
}, [success]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Added type for 'e'
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    try {
      individualSchema.parse(form); // This will throw if validation fails
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors?.[0]?.message || "Invalid input in form fields.");
      } else {
        setError("Invalid input.");
      }
      return;
    }

    setLoading(true);
    try {
      console.log("form id", form.id);
      const method = form.id ? "PUT" : "POST";
      const endpoint = form.id
        ? `/api/individual/${form.id}`
        : "/api/individual";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
     
      if (data.success) {
        setSuccess(form.id ? "updated" : "created");
     
      } else {
        setError(data.message || "Failed to create profile");
      }
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/individual/cmbfwtz9y0001vdd8dfe3lmez"); // Adjust endpoint if needed
        const data = await res.json();
        console.log("data is", data);
        if (data.success && data.data) {
          setForm({
            ...form,
            ...data.data,
            experiences: data.data.experiences || [],
          });
        }
      } catch (err) {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const themeColor = "blue";
  const themeAccentText = `text-${themeColor}-700 dark:text-${themeColor}-400`;
  const themeAccentBorder = `border-${themeColor}-300 dark:border-${themeColor}-600`;
  const themeAccentRing = `focus:ring-${themeColor}-600 dark:focus:ring-${themeColor}-500 focus:border-${themeColor}-600 dark:focus:border-${themeColor}-500`;
  const themeButtonBg = `bg-${themeColor}-600 dark:bg-${themeColor}-500`;
  const themeButtonHoverBg = `hover:bg-${themeColor}-700 dark:hover:bg-${themeColor}-600`;

  return (
    <div className="space-y-6">
      {" "}
      {/* Outer container from the styled page */}
      {/* Heading from the styled page */}
      <HeadingIndividual
        title="My Profile"
        description="Create or update your personal information."
        icon={<UserSquare className={`w-7 h-7 ${themeAccentText}`} />} // Apply theme color
      />
      {/* Card styling from the styled page */}
      <Card
        className={`w-full max-w-2xl mx-auto ${themeAccentBorder} shadow-lg dark:bg-slate-800`}
      >
        <CardHeader>
          <CardTitle className={`${themeAccentText}`}>
            Create Your Profile
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Fill in your details to complete your profile. Your information
            helps others connect with you.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            {/* Avatar from the styled page */}
            {/*   <div className="flex justify-center mb-4">
              <Avatar className={`w-24 h-24 border-2 ${themeAccentBorder}`}>
                <AvatarImage
                  src={form.profileImage || undefined}
                  alt={`${form.position || "User"}'s profile image`}
                />
                <AvatarFallback
                  className={`text-2xl bg-slate-100 dark:bg-slate-700 ${themeAccentText}`}
                >
                  {form.position
                    ? form.position.substring(0, 1).toUpperCase()
                    : "A"}
                </AvatarFallback>
              </Avatar>
            </div> */}

            {/* Form fields using Label and Input from shadcn/ui, styled like the target page */}

            <div className="space-y-1.5">
              <Label
                htmlFor="position"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Position
              </Label>
              <Input
                id="position"
                name="position"
                placeholder="e.g., Software Engineer, Product Manager"
                value={form.position}
                onChange={handleChange}
                disabled={loading}
                // required // Retained from your original code
                className={`${themeAccentRing} dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400`}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="bio"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us a bit about yourself, your skills, or professional interests..."
                value={form.bio || ""}
                onChange={handleChange}
                rows={4}
                disabled={loading}
                className={`${themeAccentRing} dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400`}
              />
            </div>

            <FileUploadField
              name="profileImage"
              label="Profile Image"
              placeholder="Upload your profile image"
              icon={Upload}
              value={form.profileImage}
              onChange={(url, fileId) =>
                setForm((f) => ({
                  ...f,
                  profileImage: url,
                  imageFileId: fileId,
                }))
              }
            />

            <div className="space-y-1.5">
              <Label
                htmlFor="company"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Company / Organization
              </Label>
              <Input
                id="company"
                name="company"
                placeholder="e.g., Acme Corp"
                value={form.company ?? ""}
                onChange={handleChange}
                disabled={loading}
                className={`${themeAccentRing} dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400`}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="website"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Website
              </Label>
              <Input
                id="website"
                name="website"
                placeholder="e.g., https://yourwebsite.com"
                value={form.website ?? ""}
                onChange={handleChange}
                disabled={loading}
                className={`${themeAccentRing} dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400`}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="linkedinUrl"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                LinkedIn URL
              </Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                placeholder="e.g., https://linkedin.com/in/yourprofile"
                value={form.linkedinUrl || ""}
                onChange={handleChange}
                disabled={loading}
                className={`${themeAccentRing} dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400`}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="timezone"
                className="text-slate-700 dark:text-slate-300 font-medium"
              >
                Timezone
              </Label>
              <select
                id="timezone"
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
                disabled={loading}
                className={`${themeAccentRing} dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 w-full rounded border px-3 py-2`}
              >
                {[
                  "UTC",
                  "GMT",
                  "Asia/Kathmandu",
                  "America/New_York",
                  "Europe/London",
                ].map((zone) => (
                  <option value={zone} key={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="country"
                  className="text-slate-700 dark:text-slate-300 font-medium"
                >
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="e.g., United States"
                  value={form.country}
                  onChange={handleChange}
                  disabled={loading}
                  // required
                  className={`${themeAccentRing} dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400`}
                />
              </div>
            </div>

            {/* Work Experience Section */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">
                Work Experience
              </Label>
              {(form.experiences ?? [])
                .map((exp, idx) => ({ ...exp, idx }))
                .filter((exp) => !exp.isCertification)
                .map(({ idx, ...exp }) => (
                  <div
                    key={idx}
                    className="border rounded p-3 mb-2 bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex gap-2 items-center mb-2">
                      <Input
                        name="role"
                        placeholder="Role"
                        value={exp.role}
                        onChange={(e) =>
                          handleExperienceChange(idx, "role", e.target.value)
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                      <Input
                        name="company"
                        placeholder="Company"
                        value={exp.company || ""}
                        onChange={(e) =>
                          handleExperienceChange(idx, "company", e.target.value)
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        name="startDate"
                        type="date"
                        value={exp.startDate || ""}
                        onChange={(e) =>
                          handleExperienceChange(
                            idx,
                            "startDate",
                            e.target.value
                          )
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                      <Input
                        name="endDate"
                        type="date"
                        value={exp.endDate || ""}
                        onChange={(e) =>
                          handleExperienceChange(idx, "endDate", e.target.value)
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                    </div>
                    <Textarea
                      name="description"
                      placeholder="Description"
                      value={exp.description || ""}
                      onChange={(e) =>
                        handleExperienceChange(
                          idx,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => removeExperience(idx)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              <Button
                type="button"
                variant="secondary"
                className="mb-4"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    experiences: [
                      ...(f.experiences ?? []),
                      {
                        ...initialExperience,
                        isCertification: false,
                      },
                    ],
                  }))
                }
                disabled={loading}
              >
                Add Work Experience
              </Button>
            </div>

            {/* Certifications Section */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">
                Certifications
              </Label>
              {(form.experiences ?? [])
                .map((exp, idx) => ({ ...exp, idx }))
                .filter((exp) => exp.isCertification)
                .map(({ idx, ...exp }) => (
                  <div
                    key={idx}
                    className="border rounded p-3 mb-2 bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex gap-2 items-center mb-2">
                      <Input
                        name="role"
                        placeholder="Certification Name"
                        value={exp.role}
                        onChange={(e) =>
                          handleExperienceChange(idx, "role", e.target.value)
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                      <Input
                        name="company"
                        placeholder="Issuing Organization"
                        value={exp.company || ""}
                        onChange={(e) =>
                          handleExperienceChange(idx, "company", e.target.value)
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        name="startDate"
                        type="date"
                        value={exp.startDate || ""}
                        onChange={(e) =>
                          handleExperienceChange(
                            idx,
                            "startDate",
                            e.target.value
                          )
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                      <Input
                        name="endDate"
                        type="date"
                        value={exp.endDate || ""}
                        onChange={(e) =>
                          handleExperienceChange(idx, "endDate", e.target.value)
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                    </div>
                    <Textarea
                      name="description"
                      placeholder="Description"
                      value={exp.description || ""}
                      onChange={(e) =>
                        handleExperienceChange(
                          idx,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => removeExperience(idx)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              <Button
                type="button"
                variant="secondary"
                className="mb-4"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    experiences: [
                      ...(f.experiences ?? []),
                      {
                        ...initialExperience,
                        isCertification: true,
                      },
                    ],
                  }))
                }
                disabled={loading}
              >
                Add Certification
              </Button>
            </div>

            {/* Displaying your original error/success messages */}
            {error && (
              <div className="text-sm font-medium text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-300 dark:border-red-700">
                {error}
              </div>
            )}
            {success === "created" && (
              <div className="text-sm font-medium text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-300 dark:border-green-700">
                Profile created successfully!
              </div>
            )}
            {success === "updated" && (
              <div className="text-sm font-medium text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-300 dark:border-green-700">
                Profile updated successfully!
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-6">
            <Button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto ${themeButtonBg} ${themeButtonHoverBg} text-white`}
            >
              {loading
                ? "Processing..."
                : form.id
                  ? "Update Profile"
                  : "Create Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
