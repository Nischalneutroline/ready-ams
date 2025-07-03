"use client";

import { useForm, FormProvider } from "react-hook-form";
import ProfileForm from "./_component/profileForm"; // Adjust the path as needed

export default function ProfileFormPage() {
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <ProfileForm />
    </FormProvider>
  );
}
