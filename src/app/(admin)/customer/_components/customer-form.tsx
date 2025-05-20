"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import InputField from "@/components/custom-form-fields/input-field";
import { User, Mail, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import PhoneField from "@/components/custom-form-fields/phone-field";
import ToggleSwitch from "@/components/custom-form-fields/toggle-switch";
import { useParams, useRouter } from "next/navigation";
import FormHeader from "@/components/admin/form-header";
import { Role } from "@/app/(admin)/customer/_types/customer";
import { useCustomerStore } from "@/app/(admin)/customer/_store/customer-store";
import {
  createSchema,
  updateSchema,
} from "@/app/(admin)/customer/_schema/customer";
import { PostCustomerData } from "../_api-call/customer-api-call";
import { useReverification, useUser } from "@clerk/nextjs";
import { EmailAddressResource } from "@clerk/types";
import { toast } from "sonner";
import clerkClient, { createClerkClient } from "@clerk/clerk-sdk-node";

// Form data type
type FormData = {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  isActive: boolean;
};

const CustomerForm = () => {
  const userId = "user_2xLhj302gLTOLa9H54voKIQK4zm";
  const { user, client } = useUser();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [emailObj, setEmailObj] = useState<EmailAddressResource | undefined>();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string | undefined;
  const isEditMode = !!id;
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const createEmailAddress = useReverification((email: string) =>
    user?.createEmailAddress({ email })
  );

  const { getCustomerById, createCustomer, updateCustomer } =
    useCustomerStore();

  // Initialize form with appropriate schema
  const form = useForm<FormData>({
    resolver: zodResolver(isEditMode ? updateSchema : createSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      isActive: true,
    },
  });

  // Fetch customer data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchCustomer = async () => {
        try {
          setIsLoading(true);
          const customer = await getCustomerById(id);
          setOldEmail(customer?.email || "");
          if (customer) {
            const formData: FormData = {
              fullName: customer.name,
              email: customer.email,
              phone: customer.phone || "",
              password: "",
              isActive: customer.isActive ?? true,
            };
            console.log("Setting form data:", formData);
            form.reset(formData);
          } else {
            router.push("/customer");
          }
        } catch (error) {
          console.error("Error fetching customer:", error);
          router.push("/customer");
        } finally {
          setIsLoading(false);
        }
      };
      fetchCustomer();
    } else {
      setIsLoading(false);
    }
  }, [id, isEditMode, getCustomerById, form, router]);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const customerData: PostCustomerData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: Role.USER,
        password: formData.password || undefined,
        isActive: formData.isActive,
      };

      console.log("Submitting customer data:", customerData);

      let result;

      if (isEditMode && id) {
        const updatedCustomer = await getCustomerById(id);
        if (!updatedCustomer) {
          throw new Error("Customer not found");
        }

        result = await updateCustomer(id, customerData);

        if (result.success) {
          // Update user data
          const response = await fetch("/api/user/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fullName: formData.fullName,
              role: Role.USER,
              userId: user?.id || "",
            }),
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || "Failed to update user");
          }

          // Only handle email verification if email has changed
          if (formData.email !== updatedCustomer.email) {
            try {
              const res = await createEmailAddress(formData.email);
              setNewEmail(formData.email);
              await user?.reload();

              const emailAddress = user?.emailAddresses.find(
                (a) => a.id === res?.id
              );

              if (emailAddress) {
                await emailAddress.prepareVerification({
                  strategy: "email_code",
                });
                setEmailObj(emailAddress);
                setIsVerificationModalOpen(true);
                toast.success("Verification code sent to new email.");
              }
            } catch (err) {
              console.error("Error with email verification:", err);
              throw err;
            }
          }
        }
      } else {
        result = await createCustomer(customerData);
        console.log(customerData, "customerData");
        if (result.success) {
          try {
            const response = await fetch("/api/user/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: Role.USER,
              }),
            });

            const data = await response.json();
            if (!data.success) {
              throw new Error(data.error || "Failed to create user");
            }
            console.log("User created:", data.user);
          } catch (error) {
            console.error("Error creating user:", error);
            throw error;
          }
        }
      }

      // Only navigate after all operations are complete
      if (result.success) {
        toast.success(
          isEditMode
            ? "Customer updated successfully"
            : "Customer created successfully"
        );
        setTimeout(() => {
          router.push("/customer");
        }, 500);
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} customer:`,
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle the submission of the verification form
  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!emailObj || !code) {
        throw new Error("Please provide both email and verification code");
      }

      console.log("Attempting email verification...");
      const emailVerifyAttempt = await emailObj.attemptVerification({ code });
      console.log("Verification attempt result:", emailVerifyAttempt);

      if (emailVerifyAttempt?.verification.status === "verified") {
        // Update the email as primary
        console.log("verified email");
        await client.users.updateUser(userId || "", {
          primaryEmailAddressId: emailObj.id,
        });

        // Delete the old email address
        const user = await client.users.getUser(userId || "");
        const oldEmail = user.emailAddresses.find(
          (email: any) => email.emailAddress === oldEmail
        );
        if (oldEmail && oldEmail.id !== emailObj.id) {
          await client.emailAddresses.deleteEmailAddress(oldEmail.id);
        }

        // Show success message
        toast.success("Email verified and updated successfully!");
        setIsVerificationModalOpen(false);

        // Add a small delay before navigation to ensure all operations are complete
        setTimeout(() => {
          router.push("/customer");
        }, 500);
      } else {
        toast.error("Verification failed. Please try again.");
        console.error("Verification attempt failed:", emailVerifyAttempt);
      }
    } catch (err) {
      toast.error("Error verifying email. Please try again.");
      console.error("Verification error:", err);
    }
  };

  const handleBack = () => {
    router.push("/customer");
  };

  return (
    <>
      <FormHeader
        title={isEditMode ? "Edit Customer Details" : "Create Customer"}
        description={
          isEditMode
            ? "Update customer information"
            : "Create a new customer account"
        }
      />
      {isLoading ? (
        <div className="flex justify-center items-center py-10">Loading...</div>
      ) : (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 h-full"
          >
            <div className="space-y-4">
              <InputField
                name="fullName"
                label="Full Name"
                placeholder="Enter full name"
                icon={User}
              />
              <InputField
                name="email"
                label="Email"
                type="email"
                placeholder="Enter email address"
                icon={Mail}
              />
              <PhoneField name="phone" label="Phone" />
              <ToggleSwitch
                name="isActive"
                label="Active"
                icon={<ShieldAlert className="size-4 text-gray-500" />}
              />
              <div className="relative">
                <InputField
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isEditMode
                      ? "Enter new password (optional)"
                      : "Enter password"
                  }
                  icon={Lock}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-6 rounded-full"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4 text-gray-500" />
                  ) : (
                    <Eye className="size-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                ← Back
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Customer"
                    : "Create Customer"}
              </Button>
            </div>
          </form>
          {isVerificationModalOpen && (
            <Dialog
              open={isVerificationModalOpen}
              onOpenChange={setIsVerificationModalOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Email Verification</DialogTitle>
                </DialogHeader>
                <form onSubmit={verifyCode} className="space-y-4">
                  <label htmlFor="code" className="block text-sm font-medium">
                    Enter Verification Code sent to {newEmail}
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <Button
                    type="submit"
                    className="w-full hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
                    onClick={() => setIsVerificationModalOpen(false)}
                  >
                    Verify Email
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </FormProvider>
      )}
    </>
  );
};

export default CustomerForm;
