"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LucideIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";

interface FileUploadFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  icon?: LucideIcon;
  value?: string | null;
  onChange?: (url: string, fileId?: string) => void;
}

const FileUploadField = ({
  name,
  label,
  placeholder,
  className,
  icon: Icon,
  value,
  onChange,
}: FileUploadFieldProps) => {
  const { setValue, watch, control } = useFormContext();
  const imageUrl = watch(name);
  // Use imageUrl from watch, but fallback to value if imageUrl is undefined
  const displayImageUrl = imageUrl ?? value;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onChange?.(data.data.url, data.data.fileId);
        setValue(name, data.data.url);
        setValue(`${name}FileId`, data.data.fileId);
      } else {
        setUploadError("Upload failed");
      }
    } catch (error) {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    const fileId = watch(`${name}FileId`);
    if (fileId) {
      await fetch("/api/delete-image", {
        method: "DELETE",
        body: JSON.stringify({ fileId }),
      });
    }
    setValue(name, "");
    setValue(`${name}FileId`, "");

    onChange?.("", "");

    // After upload (success or fail), reset the input value:
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <div className="flex gap-2 items-center">
            {Icon && <Icon className="size-4 text-gray-500" />}
            <FormLabel>{label}</FormLabel>
          </div>
          <FormControl>
            <div>
              <Input
                ref={inputRef}
                type="file"
                accept="image/*"
                placeholder={placeholder}
                className={cn("w-max", className)}
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploading && <span className="ml-2 text-sm">Uploading...</span>}
              {uploadError && (
                <span className="ml-2 text-sm text-red-500">{uploadError}</span>
              )}
              {displayImageUrl && (
                <div className="relative inline-block mt-2">
                  <img
                    src={displayImageUrl}
                    alt="Cover"
                    width={200}
                    className="rounded"
                  />
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100 transition"
                    title="Delete image"
                    disabled={uploading}
                  >
                    <Trash2 className="text-red-500 w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FileUploadField;
