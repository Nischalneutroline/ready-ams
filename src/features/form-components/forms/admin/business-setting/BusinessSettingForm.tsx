"use client";

import React, { useEffect, useState } from "react";
import {
  addUserBtnProps,
  cancelBtnProps,
  cityProps,
  commonActions,
  emailProps,
  emptyFormProps,
  fullNameProps,
  messageProps,
  phoneProps,
  roleProps,
} from "@/features/shared-features/form/formporps";
import { useForm } from "react-hook-form";
import { RootState, useAppDispatch, useAppSelector } from "@/state/store";
import {
  setAddBusinessFormTrue,
  setAddNotificationFormTrue,
} from "@/state/admin/AdminSlice";
import Button from "@/features/shared-features/common/button";
import SelectInput from "@/features/shared-features/form/selectinput";
import { ReminderCheckboxes } from "@/features/shared-features/form/remindercheckerinput";
import TextInput from "@/features/shared-features/form/inputtext";
import {
  DateInput,
  DaysSelection,
  HoliDaysSelection,
  TimeInput,
} from "@/features/shared-features/form/dayinput";
import SwitchInput from "@/features/shared-features/form/switchinput";
import { DayAndTimeSelection } from "@/features/shared-features/form/dayandtimeselection";
import { createBusiness, retrieveBusiness } from "@/state/admin/AdminServices";
import { formOuterDivCss } from "@/features/shared-features/form/props";
import { ServiceAvailability } from "@/app/(admin)/service/_types/service";

const BusinessSettingForm = () => {
  // Redux Variable
  const dispatch = useAppDispatch();

  const { details } = useAppSelector(
    (state: RootState) => state.admin.admin.business.view.response
  );

  const dataToEdit = details?.find(
    (u: any) => u.id === "cmbfcqfal0025vdgkgj6d2n0a"
  );

  console.log(dataToEdit, "inside business detail");
  // Submit handler
  const onSubmit = (data: any) => {
    const businessTransformed = {
      name: data.name,
      industry: data.industry,
      email: data.email,
      phone: data.phone,
      website: `https://${data.website}`,
      businessRegistrationNumber: data.businessRegistrationNumber,
      taxId: data.taxId,
      taxIdFileId: data.taxIdFileId,
      logo: data.logo, 
      logoFileId: data.logoFileId,
      status: data.status,
      address: [
        {
          street: data.street,
          city: data.city,
          country: data.country,
          zipCode: data.zipCode,
          googleMap: data.googleMap,
        },
      ],
      businessAvailability: data.businessAvailability.map(
        (availability: any) => ({
          weekDay: availability.weekDay,
          type: "GENERAL", // or dynamic if applicable
          timeSlots: availability.timeSlots.map((slot: any) => ({
            startTime: new Date(
              `2025-03-01T${slot.startTime}:00.000Z`
            ).toISOString(),
            endTime: new Date(
              `2025-03-01T${slot.endTime}:00.000Z`
            ).toISOString(),
          })),
        })
      ),
      holiday: data.holiday.map((day: string) => ({
        holiday: day,
        type: "GENERAL",
        date: new Date().toISOString(), // Optional: You can customize the date logic here
      })),
    };

    // console.log("Transformed Data:", businessTransformed);

    dispatch(createBusiness(businessTransformed));
    reset();
    dispatch(setAddBusinessFormTrue(false));
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
  const transformAvailability = (apiData: any[]): ServiceAvailability[] => {
    return apiData?.map((entry) => ({
      weekDay: entry.weekDay,
      timeSlots: entry.timeSlots.map(
        (slot: { id: string; startTime: string; endTime: string }) => ({
          id: slot.id,
          startTime: new Date(slot.startTime).toISOString().substring(11, 16), // format to HH:mm
          endTime: new Date(slot.endTime).toISOString().substring(11, 16), // format to HH:mm
        })
      ),
    }));
  };

  const holidayDays = dataToEdit?.holiday?.map((h: any) => h.holiday) || [];
  const addressValue = dataToEdit?.address;
  console.log(addressValue, "addressValue");

  const remaining = { actions: commonActions, form, css: {} };

  const industryOptions = [
    { label: "Salon & Spa", value: "Salon & Spa" },
    { label: "Medical & Health", value: "Medical & Health" },
    { label: "Automotive Services", value: "Automotive Services" },
    { label: "Home Repair & Maintenance", value: "Home Repair & Maintenance" },
    { label: "Fitness & Wellness", value: "Fitness & Wellness" },
    { label: "Education & Training", value: "Education & Training" },
    { label: "Legal & Consulting", value: "Legal & Consulting" },
    { label: "IT Services", value: "IT Services" },
  ];

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Pending", value: "PENDING" },
    { label: "Suspended", value: "SUSPENDED" },
  ];
  const weekOptions = [
    { label: "Mon", value: "MONDAY" },
    { label: "Tue", value: "TUESDAY" },
    { label: "Wed", value: "WEDNESDAY" },
    { label: "Thu", value: "THURSDAY" },
    { label: "Fri", value: "FRIDAY" },
    { label: "Sat", value: "SATURDAY" },
    { label: "Sun", value: "SUNDAY" },
  ];

  const formObj: any = {
    name: {
      common: emptyFormProps({
        input: "name",
        placeholder: "Enter Your Business Name",
        defaultValue: dataToEdit?.name,
        label: "Business Name",
        showImportant: true,
      }),
      ...remaining,
    },
    industry: {
      common: fullNameProps({
        input: "industry",
        label: "Company/Industry ",
        defaultValue: dataToEdit?.industry,
        placeholder: "Select Industry",
        showImportant: true,
        type: "select",
      }),
      options: industryOptions,
      ...remaining,
    },
    phone: {
      common: phoneProps({
        input: "phone",
        label: "Phone Number",
        placeholder: "Enter your number",
        defaultValue: dataToEdit?.phone,

        type: "phone",
        showImportant: true,
      }),

      ...remaining,
    },
    email: {
      common: emailProps({
        input: "email",
        label: "Email",
        defaultValue: dataToEdit?.email,
        placeholder: "Enter your Email Address",
        type: "email",
        showImportant: true,
      }),

      ...remaining,
    },
    website: {
      common: cityProps({
        input: "website",
        label: "Website",
        defaultValue: dataToEdit?.website,

        placeholder: "Your Business Website URL",
        type: "website",
        showImportant: true,
      }),

      ...remaining,
    },
    country: {
      common: cityProps({
        input: "country",
        label: "Country",
        placeholder: "Enter your Country name",

        type: "text",
        showImportant: true,
      }),

      ...remaining,
    },

    street: {
      common: roleProps({
        input: "street",
        label: "Street",
        placeholder: "Enter your Street Name",
        type: "text",
        showImportant: true,
      }),

      ...remaining,
    },
    city: {
      common: roleProps({
        input: "city",
        label: "City ",
        placeholder: "Enter your City Name",
        type: "text",
        showImportant: true,
      }),

      ...remaining,
    },
    zipCode: {
      common: roleProps({
        input: "zipCode",
        label: "Zip Code",
        placeholder: "Enter your Zip Code",
        type: "text",
        showImportant: true,
      }),

      ...remaining,
    },
    googleMap: {
      common: emptyFormProps({
        input: "googleMap",
        label: "Google Map",
        placeholder: "Upload Your Map",
        showImportant: true,
        type: "text",
      }),

      ...remaining,
    },
    businessRegistrationNumber: {
      common: emptyFormProps({
        input: "businessRegistrationNumber",
        label: "Business Registration Number",
        defaultValue: dataToEdit?.businessRegistrationNumber,
        placeholder: "Enter Business Registration Number",
        showImportant: true,
      }),
      ...remaining,
    },
    status: {
      common: emptyFormProps({
        input: "status",
        label: "Business Status",
        defaultValue: dataToEdit?.status,
        placeholder: "Select your current business Status",
        showImportant: true,
      }),
      options: statusOptions,

      ...remaining,
    },
    businessLogo: {
      common: emptyFormProps({
        input: "businessLogo",
        label: "Business Image / Logo",
        placeholder: "Upload your business image or logo",
        showImportant: true,
      }),
      ...remaining,
    },
    businessAvailability: {
      common: emptyFormProps({
        input: "businessAvailability",
        label: "Business Availability",
        placeholder: "Enter the business time",
        showImportant: true,
        defaultValue: transformAvailability(dataToEdit?.businessAvailability),
      }),
      ...remaining,
      css: { divCss: "min-h-[150px] gap-y-4" },
    },
    holiday: {
      common: emptyFormProps({
        input: "holiday",
        label: "Holiday",
        defaultValue: holidayDays,
        showImportant: true,
      }),
      options: weekOptions,
      ...remaining,
    },
  };
  const handleCancleButton = () => {
    dispatch(setAddBusinessFormTrue(false));
  };
  useEffect(() => {
    dispatch(retrieveBusiness());
  }, [dispatch]);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${formOuterDivCss}   gap-8 lg:w-[880px]`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col jutify-start px-2  gap-2   ">
          <h1 className="text-black font-semibold text-[18px]">
            Edit Business ?
          </h1>
          <p className="italic text-[12px] sm:text-[14px] text-slate-600">
            Business Details and Information can be changed here.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="col-span-1">
                <TextInput {...formObj.name} />
              </div>
              <div className="col-span-1">
                <SelectInput {...formObj.industry} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <TextInput {...formObj.email} />
              <TextInput {...formObj.website} />
              <TextInput {...formObj.phone} />
            </div>
          </div>

          {dataToEdit?.address.map((addr: any, index: number) => {
            console.log(index, "number of adress");
            return (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 ">
                <TextInput {...formObj.country} defaultValue={addr?.country} />
                <TextInput {...formObj.street} />
                <TextInput {...formObj.city} />
                <TextInput {...formObj.zipCode} />
                <TextInput {...formObj.googleMap} />
              </div>
            );
          })}

          <div className="grid grid-cols-1 sm:grid-cols-2 ">
            <div className="col-span-1">
              <TextInput {...formObj.businessRegistrationNumber} />
            </div>
            <div className="col-span-1">
              <SelectInput {...formObj.status} />
            </div>
          </div>

          <DayAndTimeSelection {...formObj.businessAvailability} />

          <HoliDaysSelection {...formObj.holiday} />
        </div>
      </div>

      <div className=" flex mb-4 w-full justify-center gap-4">
        <Button {...cancelBtnProps(handleCancleButton)} />

        <Button {...addUserBtnProps} />
      </div>
    </form>
  );
};

export default BusinessSettingForm;
