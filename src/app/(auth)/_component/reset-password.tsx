"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Check, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResetPasswordSchema,
  ResetPasswordType,
} from "../_schemas/new-password-schema";

interface ResetPasswordFormProps {
  onBackToLogin: () => void;
}

const ResetPasswordForm = ({ onBackToLogin }: ResetPasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    return {
      strength,
      checks,
      label: strength < 2 ? "Weak" : strength < 4 ? "Medium" : "Strong",
      color:
        strength < 2
          ? "bg-red-500"
          : strength < 4
            ? "bg-yellow-500"
            : "bg-green-500",
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  // Watch the password field for strength checking
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const passwordStrength = getPasswordStrength(passwordValue || "");

  const onSubmit = async (data: ResetPasswordType) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength.strength < 3) {
      toast.error("Password is too weak. Please choose a stronger password.");
      return;
    }

    setIsLoading(true);

    console.log(data);
    setIsLoading(false);
    reset();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Set New Password
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Create a strong password for your Appointege account
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6 mb-6"
        noValidate
      >
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-slate-700 font-medium text-sm"
          >
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="pl-9 sm:pl-10 pr-10 sm:pr-12 h-10 sm:h-12 border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl text-sm sm:text-base"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>

          {passwordValue && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Password strength:
                </span>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength.strength < 2
                      ? "text-red-600"
                      : passwordStrength.strength < 4
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
              <div className="space-y-1">
                {Object.entries(passwordStrength.checks).map(
                  ([key, passed]) => (
                    <div
                      key={key}
                      className="flex items-center space-x-2 text-xs"
                    >
                      {passed ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <X className="w-3 h-3 text-slate-400" />
                      )}
                      <span
                        className={passed ? "text-green-600" : "text-slate-500"}
                      >
                        {key === "length" && "At least 8 characters"}
                        {key === "lowercase" && "One lowercase letter"}
                        {key === "uppercase" && "One uppercase letter"}
                        {key === "number" && "One number"}
                        {key === "special" && "One special character"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-slate-700 font-medium text-sm"
          >
            Confirm New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className="pl-9 sm:pl-10 pr-10 sm:pr-12 h-10 sm:h-12 border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl text-sm sm:text-base"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
          {confirmPasswordValue && passwordValue !== confirmPasswordValue && (
            <p className="text-red-500 text-xs">Passwords do not match</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={
            isLoading || !watch("password") || !watch("confirmPassword")
          }
          className="w-full h-10 sm:h-12 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 text-sm sm:text-base"
        >
          {isLoading ? "Updating Password..." : "Update Password"}
        </Button>
      </form>

      <button
        onClick={onBackToLogin}
        className="w-full flex items-center justify-center text-sm text-sky-600 hover:text-sky-700 font-medium py-2 transition-all duration-200 hover:underline transform hover:scale-[1.02]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Login
      </button>
    </div>
  );
};

export default ResetPasswordForm;
