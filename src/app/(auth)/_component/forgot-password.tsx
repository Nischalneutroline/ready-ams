"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"

interface ForgotPasswordProps {
  onBackToLogin: () => void
  onForwardToReset: () => void
}

const ForgotPassword = ({
  onBackToLogin,
  onForwardToReset,
}: ForgotPasswordProps) => {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Password reset for:", email)
    setIsSubmitted(true)
    onForwardToReset()
  }

  if (isSubmitted) {
    return (
      <div className="animate-fade-in">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="text-center py-12 px-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your email and follow the instructions to reset your
              password.
            </p>
            <Button
              onClick={onBackToLogin}
              variant="outline"
              className="w-full h-12 border-gray-200 hover:bg-gray-50 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-slide-in-right">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 transition-all duration-300 hover:shadow-3xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Reset Password
          </CardTitle>
          <p className="text-gray-600 leading-relaxed">
            Enter the email associated with your account, and we'll send you a
            password reset link.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Send Reset Link Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Send Reset Link
            </Button>
          </form>

          {/* Back to Login Link */}
          <button
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 transition-all duration-200 hover:underline transform hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
