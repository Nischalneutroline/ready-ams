"use client";
import React from "react";
import LoginForm from "../_component/sign-in";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <LoginForm
      onSwitchToSignUp={() => router.push("/sign-up")}
      onSwitchToForget={() => router.push("/reset-password")}
    />
  );
};

export default page;
