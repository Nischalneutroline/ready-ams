import { motion } from "framer-motion"
import InputField from "@/components/custom-form-fields/input-field"
import FileUploadField from "@/components/custom-form-fields/image-upload"
import { FileText, Upload, Shield } from "lucide-react"

export default function LegalComplianceStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Legal & Compliance Information
        </h3>
        <p className="text-gray-600">
          Ensure your business meets all legal requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <InputField
            name="registrationNumber"
            label="Business Registration Number"
            placeholder="Enter your business registration number"
            icon={FileText}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <FileUploadField
            name="taxId"
            label="Tax ID / EIN / PAN (Optional)"
            placeholder="Upload Tax ID document"
            icon={Upload}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
