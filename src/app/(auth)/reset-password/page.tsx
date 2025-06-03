"use client";

import React from "react";
import ForgotPasswordForm from "../_component/forgot-password";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <ForgotPasswordForm
      onBackToLogin={() => router.push("/sign-in")}
      onForwardToReset={() => router.push("/new-password")}
      onBackToResetPassword={() => router.push("/new-password")}
    />
  );
};

export default page;
