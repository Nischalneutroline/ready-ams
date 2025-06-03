"use client"

import { useState } from "react"
import SignIn from "./sign-in"
import SignUp from "./sign-up"
import ForgotPassword from "./forgot-password"
import { CircleCheckBig, Clock, Users } from "lucide-react"
import ResetPassword from "./reset-password"

type AuthView = "signin" | "signup" | "forgot" | "reset-password"

const Auth = () => {
  const [currentView, setCurrentView] = useState<AuthView>("signin")

  const renderAuthComponent = () => {
    switch (currentView) {
      case "signin":
        return (
          <SignIn
            onSwitchToSignUp={() => setCurrentView("signup")}
            onSwitchToForgot={() => setCurrentView("forgot")}
          />
        )
      case "signup":
        return <SignUp onSwitchToSignIn={() => setCurrentView("signin")} />
      case "forgot":
        return (
          <ForgotPassword
            onBackToLogin={() => setCurrentView("signin")}
            onForwardToReset={() => setCurrentView("reset-password")}
          />
        )
      case "reset-password":
        return <ResetPassword onBackToLogin={() => setCurrentView("signin")} />
      default:
        return (
          <SignIn
            onSwitchToSignUp={() => setCurrentView("signup")}
            onSwitchToForgot={() => setCurrentView("forgot")}
          />
        )
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/3  flex-col items-start text-white pl-20 p-8 relative overflow-hidden bg-[#edf2ff] ">
        {/* Content */}
        <div className="relative z-10 text-start top-40 ">
          <div className="flex flex-col mb-8 gap-1">
            <div className="flex items-center justify-start ">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl text-black font-bold">Appointege</h1>
            </div>
            <p className="text-black text-lg">
              Professional Appointment Management
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col space-y-[2px]">
              <p className="text-start text-4xl text-black font-bold">
                Streamline Your
              </p>
              <span className="text-start text-4xl text-blue-500 font-bold">
                Appointment Workflow
              </span>
            </div>
            <div className="text-lg text-black">
              Transform how you manage appointments with our intuitive platform
              designed for modern professionals.
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4 text-black font-semibold">
            <div className="flex items-center text-blue-100 gap-2">
              <div className="h-6 w-6 bg-blue-500 rounded-md flex justify-center items-center">
                <Clock
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </div>
              <span className="text-black text-sm">
                Smart scheduling automation
              </span>
            </div>
            <div className="flex items-center text-blue-100 gap-2">
              <div className="h-6 w-6 bg-blue-500 rounded-md flex justify-center items-center">
                <Users
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </div>
              <span className="text-black text-sm">
                Seamless client management
              </span>
            </div>
            <div className="flex items-center text-blue-100 gap-2">
              <div className="h-6 w-6 bg-blue-500 rounded-md flex justify-center items-center">
                <CircleCheckBig
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </div>
              <span className="text-black text-sm">
                Real time availability sync
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-4 bg-[#f4f8fe]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden absolute animate-fade-in top-0 left-0 py-3  bg-[#fefeff] w-full justify-center items-center border-b-1">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-800">Appointege</h1>
                <p className="text-gray-600 text-xs">
                  Streamline Your Workflow
                </p>
              </div>
            </div>
          </div>

          {/* Auth Component with Tailwind animations */}
          <div key={currentView} className="animate-fade-in">
            {renderAuthComponent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
