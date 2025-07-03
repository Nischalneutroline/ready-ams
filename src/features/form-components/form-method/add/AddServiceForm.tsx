"use client";

import { adminServiceSchema } from "@/schemas/validation/validationSchema";
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  commonActions,
  emptyFormProps,
  messageProps,
  roleProps,
} from "@/features/shared-features/form/formporps";
import CenterSection from "@/features/shared-features/section/centersection";

import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { useForm } from "react-hook-form";
import { RootState, useAppDispatch, useAppSelector } from "@/state/store";
import {
  setAddCustomerFormTrue,
  setAddServiceFormTrue,
} from "@/state/admin/AdminSlice";
import CloseIcon from "@mui/icons-material/Close";

import ServiceForm from "../../forms/admin/ServiceForm";
import { createService, retrieveBusiness } from "@/state/admin/AdminServices";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import {
  formContainerCss,
  formSubTitleCss,
  formTitleCss,
  formTitleDivCss,
} from "@/features/shared-features/form/props";
const AddServiceForm = () => {
  // Redux Variable
  const dispatch = useAppDispatch();
  const { isFlag } = useAppSelector(
    (state: RootState) => state.admin.admin.service.add
  );

  //   const { isSuccess } = useAppSelector(
  //     (state: RootState) => state.admin.admin.user.add.response
  //   );
  // Submit handler
  const onSubmit = (data: any) => {
    console.log(data, "on submit");
    const parsedData = {
      title: data.title,
      description: data.description,
      estimatedDuration: Number(data.estimatedDuration),
      status: data.avalabilities ? "ACTIVE" : "INACTIVE",
      businessDetailId: data.businessDetailId ?? "cmbfcqfal0025vdgkgj6d2n0a",

      // Parse the weekly availability with time slots
      serviceAvailability: data.serviceHourDay?.map((day: any) => ({
        weekDay: day.weekDay,
        timeSlots: day.timeSlots?.map((slot: any) => ({
          startTime: `1970-01-01T${slot.startTime}:00`,
          endTime: `1970-01-01T${slot.endTime}:00`,
        })),
      })),
    };

    dispatch(createService(parsedData));
    console.log(parsedData, "parsdedData");
    reset();
    dispatch(setAddServiceFormTrue(false));
  };
  const generateTimeDurations = (maxMinutes = 240, step = 10) => {
    const options = [];
    for (let min = step; min <= maxMinutes; min += step) {
      const hours = Math.floor(min / 60);
      const minutes = min % 60;
      let label = "";

      if (hours > 0) {
        label = `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
      } else {
        label = `${minutes}m`;
      }

      options.push({
        value: Number(min),
        label,
      });
    }

    return options;
  };

  //  Ref for closing modal on outside click
  const formRef = useRef<HTMLDivElement>(null);

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
  } = useForm({
    mode: "onSubmit",
    // resolver: zodResolver(adminServiceSchema),
  });

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

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];
  const options = [
    { label: "Mon", value: "MONDAY" },
    { label: "Tue", value: "TUESDAY" },
    { label: "Wed", value: "WEDNESDAY" },
    { label: "Thu", value: "THURSDAY" },
    { label: "Fri", value: "FRIDAY" },
    { label: "Sat", value: "SATURDAY" },
    { label: "Sun", value: "SUNDAY" },
  ];

  const formObj: any = {
    title: {
      common: roleProps({
        input: "title",
        label: "Service Title",

        placeholder: "Enter Service Name",
        showImportant: true,
      }),
      ...remaining,
    },
    coverPhoto: {
      common: roleProps({
        input: "coverPhoto",
        label: "Cover Photo",
        type: "file",
        placeholder: "Upload a service picture",
        showImportant: true,
      }),
      ...remaining,
    },

    description: {
      common: messageProps({
        input: "description",
        label: "Description",
        type: "textbox",
        placeholder: "Short description of this service",
        showImportant: true,
      }),
      ...remaining,
    },

    estimatedDuration: {
      common: roleProps({
        input: "estimatedDuration",
        label: " Duration",

        placeholder: "Select Estimated Duration",
        showImportant: true,
      }),
      options: generateTimeDurations(240, 10),
      ...remaining,
      css: {
        divCss:
          "relative pt-2 flex flex-col sm:flex-row gap-4 text-sm text-gray-800 w-full max-w-full px-2 sm:px-3 lg:px-4 sm:h-[50px] items-start sm:items-center pb-3",
        labelCss:
          "font-medium flex items-center gap-2 text-sm sm:text-[15px] lg:text-[15px] text-[#1F2937] tracking-wide",
      },
    },

    serviceAvailability: {
      common: roleProps({
        input: "serviceAvailability",
        label: "Service Days",
        placeholder: "Select a Current Service Status",
        showImportant: true,
        defaultValue: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        disabledValue: ["SATURDAY", "SUNDAY"],
      }),
      options,
      ...remaining,
    },
    serviceHourDay: {
      common: roleProps({
        input: "serviceHourDay",
        label: "Service Hour / Day",
        showImportant: true,
      }),
      options,
      ...remaining,
    },
    avalabilities: {
      common: emptyFormProps({
        input: "avalabilities",
        label: "Avaiability",
        showImportant: true,
        icon: (
          <PersonSearchIcon
            className="text-[#6C757D]"
            sx={{
              fontSize: {
                xs: "16px",
                sm: "16px",
                lg: "16px",
              },
            }}
          />
        ),
      }),
      ...remaining,
      css: {
        divCss:
          "relative pt-2 flex flex-col sm:flex-row  gap-2 text-sm text-gray-800 w-full max-w-full px-2 sm:px-3 lg:px-4  h-[80px] items-start sm:items-center",
      },
    },
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        reset();
        dispatch(setAddServiceFormTrue(false));
      }
    };
    if (isFlag) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFlag, dispatch]);

  return (
    <AnimatePresence>
      {isFlag && (
        <CenterSection>
          <motion.div
            ref={formRef}
            initial={{ y: 50, scale: 0.9 }}
            animate={{ y: 0, scale: [0.9, 1.02, 1] }}
            exit={{ y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={formContainerCss}
          >
            <div className={formTitleDivCss}>
              <div className={formTitleCss}>Service Details</div>
              <div className={formSubTitleCss}>
                Manage and Cusotmize your offered services.
              </div>
              <div
                className="absolute top-3 right-4 text-red-600 cursor-pointer"
                onClick={(e: any) => dispatch(setAddServiceFormTrue(false))}
              >
                <CloseIcon />
              </div>
            </div>
            <ServiceForm formObj={formObj} form={form} />
          </motion.div>
        </CenterSection>
      )}
    </AnimatePresence>
  );
};

export default AddServiceForm;
