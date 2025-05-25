"use client"

import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import React from "react"

interface SelectFieldProps {
  name: string
  label: string
  placeholder?: string
  options: { value: string; label: string }[]
  className?: string
  icon?: LucideIcon
  disabled?: boolean
}

const SelectField = ({
  name,
  label,
  placeholder,
  options,
  className,
  icon: Icon,
  disabled,
}: SelectFieldProps) => {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // console.log(`${name} options:`, options)
        return (
          <FormItem className="flex flex-col">
            <div className="flex gap-2 items-center">
              {Icon && <Icon className="size-4 text-gray-500" />}
              <FormLabel>{label}</FormLabel>
            </div>
            <FormControl>
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => {
                  console.log(`${name} onValueChange:`, value)
                  // Only update if the value is non-empty and exists in options
                  if (value && options.some((opt) => opt.value === value)) {
                    field.onChange(value)
                  } else {
                    console.log(
                      `${name} onValueChange ignored: Invalid or empty value`,
                      value
                    )
                  }
                }}
                disabled={disabled}
              >
                <SelectTrigger className={cn("w-full", className)}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export default SelectField
