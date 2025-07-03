"use client";

import React, { useState } from "react";
import {
  addUserBtnProps,
  cancelBtnProps,
  cityProps,
  commonActions,
  emailProps,
  emptyFormProps,
  fullNameProps,
  phoneProps,
  roleProps,
} from "@/features/shared-features/form/formporps";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/state/store";
import { setAddNotificationFormTrue } from "@/state/admin/AdminSlice";
import Button from "@/features/shared-features/common/button";
import TextInput from "@/features/shared-features/form/inputtext";
import { DateInput } from "@/features/shared-features/form/dayinput";
import SwitchInput from "@/features/shared-features/form/switchinput";
import { DayAndTimeSelection } from "@/features/shared-features/form/dayandtimeselection";
import { formOuterDivCss } from "@/features/shared-features/form/props";
import { createSupportBusinessDetails } from "@/state/admin/AdminServices";

const CustomerInfomationForm = () => {
  // Redux Variable
  const dispatch = useAppDispatch();

  // Submit handler
  const onSubmit = (formData: any) => {
    const transformedData = {
      supportBusinessName: formData.supportBusinessName,
      supportEmail: formData.supportEmail,
      supportPhone: formData.supportPhone,
      supportAddress: [
        {
          street: formData.supportAddress,
          city: "", // Fill if available
          country: "", // Fill if available
          zipCode: "", // Fill if available
          googleMap: formData.supportGoogleMap || "",
        },
      ],
      supportAvailability: formData.supportAvailability.map(
        (availability: any) => ({
          weekDay: availability.weekDay,
          type: "SUPPORT",
          timeSlots: availability.timeSlots.map((slot: any) => {
            const today = new Date().toISOString().split("T")[0]; // "2025-04-19"
            return {
              startTime: new Date(
                `${today}T${slot.startTime}:00Z`
              ).toISOString(),
              endTime: new Date(`${today}T${slot.endTime}:00Z`).toISOString(),
            };
          }),
        })
      ),
      supportHoliday: [
        {
          holiday: "SUNDAY", // fallback or you can derive it from the date if needed
          type: "SUPPORT",
          date: formData.holidayStart,
        },
      ],
      businessId: "cmbfcqfal0025vdgkgj6d2n0a",
    };
    console.log("Transformed data:", transformedData);
    dispatch(createSupportBusinessDetails(transformedData));
  };

  // React-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
    trigger,
    control,
  } = useForm({});

  const form = {
    register,
    handleSubmit,
    errors,
    onSubmit,
    setValue,
    watch,
    getValues,
    control,
    trigger,
  };

  const remaining = { actions: commonActions, form, css: {} };

  const notificationOptions = [
    { label: "Push Notification", value: "Push Notification" },
    { label: "Email", value: "Email" },
    { label: "SMS", value: "SMS" },
  ];

  const formObj: any = {
    useBusinessInfo: {
      common: emptyFormProps({
        input: "useBusinessInfo",
        placeholder: "",
        label: "Use Business Info",
        showImportant: true,
      }),
      ...remaining,
    },
    supportBusinessName: {
      common: fullNameProps({
        input: "supportBusinessName",
        label: "Company/Business Name",
        placeholder: "Enter Business Name",
      }),
      options: notificationOptions,
      ...remaining,
    },
    supportPhone: {
      common: phoneProps({
        input: "supportPhone",
        label: "Phone Number",

        type: "phone",
        showImportant: false,
      }),

      ...remaining,
    },
    supportEmail: {
      common: emailProps({
        input: "supportEmail",
        label: "Support Email",

        type: "email",
        showImportant: true,
      }),

      ...remaining,
    },
    supportAddress: {
      common: cityProps({
        input: "supportAddress",
        label: "Physical Address",
        placeholder: "Enter Street, City, Country",
        type: "text",
        showImportant: false,
      }),

      ...remaining,
    },
    supportGoogleMap: {
      common: cityProps({
        input: "supportGoogleMap",
        label: "Google Map",
        placeholder: "Enter the your Google Map link",
        type: "text",
        showImportant: false,
      }),

      ...remaining,
    },
    supportAvailability: {
      common: roleProps({
        input: "supportAvailability",
        label: "Business Day/Hour",
        showImportant: true,
      }),

      ...remaining,
    },
    hoildayStart: {
      common: emptyFormProps({
        input: "holidayStart",
        label: "Start",
        placeholder: "Holiday starts from",
        showImportant: true,
      }),

      ...remaining,
    },
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${formOuterDivCss}  gap-8 lg:w-[880px]`}
    >
      <div className="flex flex-col gap-3">
        {" "}
        <div className="flex flex-col jutify-start px-2  gap-2   ">
          <h1 className="text-black font-semibold text-[18px]">
            What to Show?
          </h1>
          <p className="italic text-[12px] sm:text-[14px] text-slate-600">
            Following details will be shown to users on About and Support & Help
            section
          </p>
        </div>
        <div className="flex flex-col jutify-start px-2  ">
          <div className="flex">
            <div className="text-black font-semibold text-[18px] felex flex-row ">
              <SwitchInput {...formObj.useBusinessInfo} />
            </div>
          </div>
          <p className="italic text-[11px] sm:text-[14px] text-slate-600 px-2 flex flex-col">
            <span>
              To let users know who to reach out to for specific issues.{" "}
            </span>
            <span>
              Following details are taken from Business Settings & Business
              Details
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="col-span-1">
              <TextInput {...formObj.supportBusinessName} />
            </div>
            <div className="col-span-1">
              <TextInput {...formObj.supportEmail} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 ">
            <div className="cols-span-1">
              <TextInput {...formObj.supportAddress} />
            </div>
            <div className="cols-span-1">
              <TextInput {...formObj.supportGoogleMap} />
            </div>

            <TextInput {...formObj.supportPhone} />
          </div>
          <div className="h-fit">
            <DayAndTimeSelection {...formObj.supportAvailability} />
          </div>
          <div className="flex flex-col w-full">
            <div className="text-[17px] font-semibold text-black">Holiday</div>
            <div className="flex ">
              <DateInput {...formObj.hoildayStart} />
            </div>
          </div>
        </div>
      </div>
      <div className=" flex flex-col mb-4  justify-center gap-4">
        <Button {...addUserBtnProps} />
      </div>
    </form>
  );
};

export default CustomerInfomationForm;
