import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, SignupType } from "../_schemas/sign-up-schema";
import { FcGoogle } from "react-icons/fc";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignUpForm = ({ onSwitchToLogin }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupType>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = (data: SignupType) => {
    console.log("Form data:", data); // This should log the form data
    if (data.password !== data.confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    setIsLoading(true);
    form.reset();
  };

  const handleSocialSignup = (provider: string) => {
    console.log(`${provider} signup clicked`);
  };

  const handleTermsChange = (checked: boolean | "indeterminate") => {
    setAgreeToTerms(checked === true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">
          Create Account
        </h2>
        <p className="text-slate-600 text-sm">
          Join Appointege and start managing appointments
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-slate-700 font-medium text-sm"
            >
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="firstName"
                type="text"
                {...form.register("firstName")}
                className="pl-9 h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl text-sm"
                placeholder="First name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-slate-700 font-medium text-sm"
            >
              Last Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="lastName"
                type="text"
                {...form.register("lastName")}
                className="pl-9 h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl text-sm"
                placeholder="Last name"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              className="pl-9 h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl text-sm"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="phoneNumber"
            className="text-slate-700 font-medium text-sm"
          >
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="phoneNumber"
              type="tel"
              {...form.register("phoneNumber")}
              className="pl-9 h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl text-sm"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-slate-700 font-medium text-sm"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...form.register("password")}
              className="pl-9 pr-10 h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl text-sm"
              placeholder="Create password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-slate-700 font-medium text-sm"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...form.register("confirmPassword")}
              className="pl-9 pr-10 h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl text-sm"
              placeholder="Confirm password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={handleTermsChange}
            className="border-slate-300 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500 mt-1"
          />
          <Label
            htmlFor="terms"
            className="text-sm text-slate-600 leading-relaxed"
          >
            I agree to the{" "}
            <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">
              Privacy Policy
            </a>
          </Label>{" "}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !agreeToTerms}
          className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 text-sm"
        >
          {isLoading
            ? "Creating Account..."
            : "Create Account & Start Managing"}
        </Button>
      </form>

      <div className="my-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">
              Or continue with
            </span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialSignup("Google")}
        className="w-full h-11 border-slate-300 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm"
      >
        <FcGoogle />
        Sign up with Google
      </Button>

      <div className="mt-6 text-center">
        <p className="text-slate-600 text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sky-600 hover:text-sky-700 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
