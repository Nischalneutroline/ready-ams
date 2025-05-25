"use client"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { toast } from "sonner"
import BusinessInfoStep from "./steps/BusinessInfoStep"
import AddressStep from "./steps/AddressStep"
import LegalComplianceStep from "./steps/LegalComplianceStep"
import BrandingStep from "./steps/BrandingStep"
import CompletionStep from "./steps/CompletionStep"
import { useBusinessStore } from "@/app/(admin)/business-settings/_store/business-store"
import { useUser } from "@clerk/nextjs"

type FormValues = {
  businessName: string
  industry: string
  email: string
  phone: string
  website?: string
  city?: string
  street?: string
  state?: string
  zipCode?: string
  country?: string
  googleMap?: string
  registrationNumber?: string
  taxId?: string
  logo?: string
  visibility?: string
}

const schema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry selection is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().optional(),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
  state: z.string().optional(),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  googleMap: z.string().optional(),
  registrationNumber: z
    .string()
    .min(1, "Business registration number is required"),
  taxId: z.any().optional(),
  logo: z.any().optional(),
  visibility: z.string().min(1, "Visibility selection is required"),
})

const steps = [
  {
    id: 1,
    title: "Business Info",
    description: "Tell us about your business",
    component: BusinessInfoStep,
  },
  {
    id: 2,
    title: "Address",
    description: "Where are you located?",
    component: AddressStep,
  },
  {
    id: 3,
    title: "Legal & Compliance",
    description: "Registration details",
    component: LegalComplianceStep,
  },
  {
    id: 4,
    title: "Branding",
    description: "Make it yours",
    component: BrandingStep,
  },
  {
    id: 5,
    title: "Completion",
    description: "You're all set",
    component: CompletionStep,
  },
]

export default function BusinessOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const { setBusinessData, setActiveTab } = useBusinessStore()
  const { user } = useUser()

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "",
      industry: "",
      email: "",
      phone: "",
      website: "",
      city: "",
      street: "",
      state: "",
      zipCode: "",
      country: "",
      googleMap: "",
      registrationNumber: "",
      taxId: "",
      logo: "",
      visibility: "",
    },
  })

  // Calculate progress based on 5 total steps (4 form steps + 1 completion step)
  const totalSteps = steps.length + 1
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  const validateCurrentStep = async () => {
    const values = form.getValues()
    let fieldsToValidate: (keyof FormValues)[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["businessName", "industry", "email", "phone"]
        break
      case 2:
        fieldsToValidate = ["city", "street", "zipCode", "country"]
        break
      case 3:
        fieldsToValidate = ["registrationNumber"]
        break
      case 4:
        fieldsToValidate = ["visibility"]
        break
      default:
        return true
    }

    const result = await form.trigger(fieldsToValidate)
    return result
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (!isValid) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }

    // Allow moving to completion step (step 5)
    if (currentStep <= steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step)
    }
  }

  const onSubmit = async (data: any) => {
    if (!user) {
      toast.error("Please login to continue")
      return
    }

    setBusinessData(data)
    toast.success("Business details saved successfully!")
    setActiveTab("Business hour & Availability")
  }

  const CurrentStepComponent = steps[currentStep - 1]?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            Welcome to Your Business Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg"
          >
            Let's set up your business profile in just a few steps
          </motion.p>
        </div>
        {/* Enhanced Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => goToStep(step.id)}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative ${
                    completedSteps.includes(step.id)
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                      : currentStep === step.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110"
                        : currentStep > step.id ||
                            completedSteps.includes(step.id - 1)
                          ? "bg-gray-200 text-gray-600 hover:bg-gray-300 group-hover:scale-105"
                          : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {completedSteps.includes(step.id) ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Step Title and Description */}
                <div className="mt-3 text-center max-w-[120px]">
                  <h4
                    className={`text-sm font-medium transition-colors duration-300 ${
                      currentStep === step.id
                        ? "text-blue-600"
                        : completedSteps.includes(step.id)
                          ? "text-green-600"
                          : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Line */}
          <div className="relative">
            <div className="w-full h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
        {/* Form Content */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="backdrop-blur-lg bg-white/80 shadow-xl border-0 overflow-hidden">
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {CurrentStepComponent && <CurrentStepComponent />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              {currentStep <= steps.length && (
                <div className="px-8 pb-8">
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {currentStep === steps.length
                        ? "Complete Setup"
                        : "Continue"}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </form>
        </FormProvider>
        {/* Completion Message (Optional Final Step Component)
        {currentStep === steps.length + 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-center"
          >
            <CompletionStep />
            <Button
              onClick={form.handleSubmit(onSubmit)}
              className="mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Finish and Save
            </Button>
          </motion.div>
        )} */}
      </div>
    </div>
  )
}
