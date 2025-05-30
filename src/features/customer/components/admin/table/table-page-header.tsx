"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TablePageHeader() {
  const router = useRouter();
  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col">
        <div className="text-md md:text-lg lg:text-xl  font-semibold text-gray-700">
          Customers
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Manage and view all customer information
        </p>
      </div>
      <div className="flex items-end justify-end">
        <Button
          type="button"
          onClick={() => {
            router.push("/customer/create");
          }}
          className=" bg-blue-600 hover:bg-blue-700 rounded-lg h-9.5 flex gap-1 md:gap-2"
        >
          <Plus className="h-5 w-5" />
          Create User
        </Button>
      </div>
    </div>
  );
}
