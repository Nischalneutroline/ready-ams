import { motion } from "framer-motion"
import SelectField from "@/components/custom-form-fields/select-field"
import FileUploadField from "@/components/custom-form-fields/image-upload"
import { Image, Eye, Palette } from "lucide-react"

const visibilityOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Suspended", value: "SUSPENDED" },
]

export default function BrandingStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Make it yours
        </h3>
        <p className="text-gray-600">
          Add your branding and set your business visibility
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FileUploadField
            name="logo"
            label="Business Logo (Optional)"
            placeholder="Upload your business logo"
            icon={Image}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SelectField
            name="visibility"
            label="Business Visibility"
            placeholder="Select visibility status"
            options={visibilityOptions}
            icon={Eye}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
