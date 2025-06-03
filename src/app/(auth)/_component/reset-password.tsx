"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, CheckCircle, ArrowLeft } from "lucide-react"

interface ResetPasswordProps {
  onBackToLogin: () => void
}

const ResetPassword = ({ onBackToLogin }: ResetPasswordProps) => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setError("")
    console.log("Password reset successfully:", newPassword)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="animate-fade-in">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="text-center py-12 px-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Password Reset Successful
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your password has been successfully updated. You can now log in
              with your new password.
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
            Create New Password
          </CardTitle>
          <p className="text-gray-600 leading-relaxed">
            Enter and confirm your new password below.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Reset Password Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Reset Password
            </Button>
          </form>

          {/* Back to Login */}
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

export default ResetPassword
