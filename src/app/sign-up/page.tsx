"use client"

import { useRouter } from "next/navigation"

export default function SignUpLanding() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-50 via-white to-indigo-50 px-6 py-12">
      <h1 className="text-5xl font-extrabold text-indigo-700 mb-10 text-center">
        Join Our Platform
      </h1>
      <p className="mb-10 text-gray-600 max-w-xl text-center">
        Choose your account type and start your journey with us.
      </p>

      <div className="flex gap-8">
        <button
          onClick={() => router.push("/sign-up/business")}
          className="w-48 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          Sign Up as Business
        </button>
        <button
          onClick={() => router.push("/sign-up/customer")}
          className="w-48 py-5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md transition"
        >
          Sign Up as Customer
        </button>
      </div>
    </div>
  )
}
