import { motion } from "framer-motion"
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CompletionStep() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-gray-800 mb-4"
      >
        Congratulations! 🎉
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xl text-gray-600 mb-8"
      >
        Your business profile has been created successfully!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
          <span className="text-lg font-semibold text-gray-800">
            What's Next?
          </span>
        </div>
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Set up your business hours</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Configure your services</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Start accepting bookings</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
