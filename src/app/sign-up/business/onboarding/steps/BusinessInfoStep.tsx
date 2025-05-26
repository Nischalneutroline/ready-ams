"use client"
import { motion } from "framer-motion"
import InputField from "@/components/custom-form-fields/input-field"
import { Building2, Briefcase, Mail, Phone } from "lucide-react"
import SelectField from "@/components/custom-form-fields/select-field"

const industryOptions = [
  { label: "Salon & Spa", value: "Salon & Spa" },
  { label: "Medical & Health", value: "Medical & Health" },
  { label: "Automotive Services", value: "Automotive Services" },
  { label: "Home Repair & Maintenance", value: "Home Repair & Maintenance" },
  { label: "Fitness & Wellness", value: "Fitness & Wellness" },
  { label: "Education & Training", value: "Education & Training" },
  { label: "Legal & Consulting", value: "Legal & Consulting" },
  { label: "IT Services", value: "IT Services" },
]

export default function BusinessInfoStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <InputField
        name="name"
        label="Business Name"
        placeholder="E.g. Neutroline Inc."
        icon={Building2}
      />
      <SelectField
        name="industry"
        label="Industry"
        placeholder="E.g. Software, Food, Fashion"
        icon={Briefcase}
        options={industryOptions}
      />
      <InputField
        name="email"
        label="Business Email"
        placeholder="e.g. contact@yourbusiness.com"
        type="email"
        icon={Mail}
      />
      <InputField
        name="phone"
        label="Phone Number"
        placeholder="e.g. +1 555 123 4567"
        type="tel"
        icon={Phone}
      />
      <InputField
        name="website"
        label="Website (Optional)"
        placeholder="e.g. www.yourbusiness.com"
        type="url"
      />
    </motion.div>
  )
}
