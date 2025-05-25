import { motion } from "framer-motion"
import InputField from "@/components/custom-form-fields/input-field"
import {
  MapPin,
  LocateFixed,
  MapPinHouse,
  Pin,
  MapPinned,
  Map,
} from "lucide-react"

export default function AddressStep() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">

        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Where is your business located?
        </h3>
        <p className="text-gray-600">
          Help customers find you with your business address
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InputField
            name="street"
            label="Street Address"
            placeholder="Enter street address"
            icon={LocateFixed}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InputField
            name="city"
            label="City"
            placeholder="Enter city"
            icon={MapPinHouse}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InputField
            name="state"
            label="State/Province"
            placeholder="Enter state or province"
            icon={MapPinned}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InputField
            name="zipCode"
            label="ZIP/Postal Code"
            placeholder="Enter ZIP or postal code"
            icon={Pin}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <InputField
            name="country"
            label="Country"
            placeholder="Enter country"
            icon={MapPin}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <InputField
            name="googleMap"
            label="Google Maps URL (Optional)"
            type="url"
            placeholder="Enter Google Maps URL"
            icon={Map}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
