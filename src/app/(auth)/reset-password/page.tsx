"use client";

import React from "react";
import ResetPasswordForm from "../_component/reset-password";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return <ResetPasswordForm onBackToLogin={() => router.push("/sign-in")} />;
};

export default page;
