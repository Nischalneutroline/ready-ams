"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import {
  ForgotPasswordSchema,
  ForgotPasswordType,
} from "../_schemas/forgot-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onForwardToReset: () => void;
  onBackToResetPassword: () => void;
}

const ForgotPassword = ({
  onBackToLogin,
  onForwardToReset,
  onBackToResetPassword,
}: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordType>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordType) => {
    console.log("Password reset for:", data.email);
    setEmail(data.email);
    setIsSubmitted(true);
    onForwardToReset();
    onBackToResetPassword();
  };

  if (isSubmitted) {
    return (
      <div className="">
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
    );
  }

  return (
    <div className="">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 transition-all duration-300 hover:shadow-3xl">
        <CardHeader className="text-center pb-2 ">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Reset Password
          </CardTitle>
          <p className="text-gray-600 leading-relaxed text-sm">
            Enter the email associated with your account, and we'll send you a
            password reset link.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
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
                  {...register("email")}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Send Reset Link Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 text-sm"
            >
              Send Reset Link
            </Button>
          </form>

          {/* Back to Login Link */}
          <Link
            href="/sign-in"
            className="w-full flex items-center justify-center text-sm text-sky-600 hover:text-sky-700 font-medium py-2 transition-all duration-200 hover:underline transform hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <Link
            href="/new-password"
            className="w-full flex items-center justify-center text-sm text-sky-600 hover:text-sky-700 font-medium py-2 transition-all duration-200 hover:underline transform hover:scale-[1.02]"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Reset Password
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
