"use client"

import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import InputField from "@/components/custom-form-fields/input-field"
import { User, Mail, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react"
import PhoneField from "@/components/custom-form-fields/phone-field"
import ToggleSwitch from "@/components/custom-form-fields/toggle-switch"
import { useParams, useRouter } from "next/navigation"
import FormHeader from "@/components/admin/form-header"
import { Role } from "@/app/(admin)/customer/_types/customer"
import { useCustomerStore } from "@/app/(admin)/customer/_store/customer-store"
import {
  createSchema,
  updateSchema,
} from "@/app/(admin)/customer/_schema/customer"
import { PostCustomerData } from "../_api-call/customer-api-call"
import { useAuth } from "@clerk/nextjs"

// Form data type
type FormData = {
  fullName: string
  email: string
  phone: string
  password?: string
  isActive: boolean
}

const CustomerForm = () => {
  const { orgId } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string | undefined
  const isEditMode = !!id
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)

  const { getCustomerById, createCustomer, updateCustomer } = useCustomerStore()

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
  })

  // Fetch customer data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchCustomer = async () => {
        try {
          setIsLoading(true)
          const customer = await getCustomerById(id)
          if (customer) {
            const formData: FormData = {
              fullName: customer.name,
              email: customer.email,
              phone: customer.phone || "",
              password: "",
              isActive: customer.isActive ?? true,
            }
            console.log("Setting form data:", formData)
            form.reset(formData)
          } else {
            router.push("/customer")
          }
        } catch (error) {
          console.error("Error fetching customer:", error)
          router.push("/customer")
        } finally {
          setIsLoading(false)
        }
      }
      fetchCustomer()
    } else {
      setIsLoading(false)
    }
  }, [id, isEditMode, getCustomerById, form, router])

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const customerData: PostCustomerData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: Role.USER,
        password: formData.password || undefined,
        isActive: formData.isActive,
        orgId: orgId as string,
      }

      console.log("Submitting customer data:", customerData)

      let result
      if (isEditMode && id) {
        console.log(customerData)
        result = await updateCustomer(id, customerData)
      } else {
        const createCustomerData = {
          ...customerData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        console.log(createCustomerData, "createCustomerData")

        result = await createCustomer(createCustomerData)
      }

      // if (result.success) {
      //   router.push("/customer")
      // }
      // Toast is handled by the store
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} customer:`,
        error
      )
      // Toast is handled by the store
    } finally {
      setIsSubmitting(false)
      form.reset()
      handleBack()
    }
  }

  const handleBack = () => {
    router.push("/customer")
    // router.refresh()
  }

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
        </FormProvider>
      )}
    </>
  )
}

export default CustomerForm
