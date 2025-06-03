"use client";
import React from "react";
import SignUpForm from "../_component/sign-up";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  return (
    <div className="mb-20 lg:mb-0">
      <SignUpForm onSwitchToLogin={() => router.push("/sign-in")} />
    </div>
  );
};

export default page;
