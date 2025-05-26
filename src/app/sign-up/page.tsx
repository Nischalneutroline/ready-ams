"use client"

import { useRouter } from "next/navigation"

export default function SignUpLanding() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-50 via-white to-indigo-50 px-6 py-12">
      <h1 className="text-6xl font-extrabold text-indigo-700 mb-10 text-center">
        Appointage
      </h1>
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-extrabold text-indigo-700  text-center">
          Join Our Platform
        </h3>
        <p className="mb-10 text-gray-600 max-w-xl text-center text-md">
          Choose your account type and start your journey with us.
        </p>
      </div>

      <div className="flex gap-8">
        <button
          onClick={() => router.push("/sign-up/business")}
          className="w-48 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          Sign Up as Business
        </button>
        <button
          onClick={() => router.push("/sign-up/customer")}
          className="w-48 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md transition"
        >
          Sign Up as Customer
        </button>
      </div>
    </div>
  )
}
