import React from "react";

import { Calendar, CircleCheckBig, Clock, Users } from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <div className="min-h-screen flex">
        {/* Left Side - Branding (Hidden on mobile) */}
        <div
          className="hidden lg:flex w-3/5 lg:w-3/6 xl:w-3/5  flex-col items-start justify-center text-white p-12 relative overflow-hidden  "
          style={{
            background: "linear-gradient(to bottom right, #f4fafe, #e8eefd)",
          }}
        >
          {/* Content */}
          <div className="relative z-10 text-start  -top-[110px]">
            <div className="flex flex-col mb-8 gap-2">
              <div className="flex items-center justify-start h-10">
                <div className="w-10 h-10 bg-[#0ba6e9] rounded-xl flex items-center justify-center mr-3 ">
                  <Calendar />
                </div>

                <h1 className="text-2xl text-black font-bold">Appointege</h1>
              </div>
              <p className="text-[#485669] text-lg font-medium -tracking-[0.0045rem] leading-7  ">
                Professional Appointment Management
              </p>
            </div>

            <div className="flex flex-col gap-6 mb-6">
              <div className="flex flex-col">
                <p className="text-start text-4xl text-black font-bold">
                  Streamline Your
                </p>
                <span className="text-start text-4xl text-[#0ba6e9] font-bold">
                  Appointment Workflow
                </span>
              </div>
              <div className="text-lg text-[#485768]">
                Transform how you manage appointments with our intuitive
                platform designed for modern professionals.
              </div>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3 text-black font-semibold">
              <div className="flex items-center text-blue-100 gap-3">
                <div className="h-7 w-7 bg-[#e0f1fe] rounded-md flex justify-center items-center">
                  <Clock
                    style={{
                      height: "16px",
                      width: "16px",
                      color: "#0185c8",
                    }}
                  />
                </div>
                <span className="text-[#485669] text-sm">
                  Smart scheduling automation
                </span>
              </div>
              <div className="flex items-center text-blue-100 gap-3">
                <div className="h-7 w-7 bg-[#e0f1fe] rounded-md flex justify-center items-center">
                  <Users
                    style={{
                      height: "16px",
                      width: "16px",
                      color: "#0185c8",
                    }}
                  />
                </div>
                <span className="text-[#485669] text-sm">
                  Seamless client management
                </span>
              </div>
              <div className="flex items-center text-blue-100 gap-3">
                <div className="h-7 w-7 bg-[#e0f1fe] rounded-md flex justify-center items-center">
                  <CircleCheckBig
                    style={{
                      height: "16px",
                      width: "16px",
                      color: "#0185c8",
                    }}
                  />
                </div>
                <span className="text-[#485669] text-sm">
                  Real time availability sync
                </span>
              </div>
            </div>
          </div>
          {/* Decorative Calendar Illustration */}
          <div className="grid grid-cols-7 gap-1 max-w-xs opacity-20">
            {Array.from({ length: 28 }, (_, i) => (
              <div
                key={i}
                className={`aspect-square rounded ${
                  i % 7 === 0 || i % 7 === 6
                    ? "bg-slate-200"
                    : Math.random() > 0.7
                      ? "bg-sky-300"
                      : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className=" w-full lg:w-3/6 xl:w-2/5 flex flex-col items-center bg-[#f4f8fe] min-h-screen">
          {/* Mobile Logo */}
          <div className="lg:hidden w-full mb-8 shadow-xs bg-[#fefeff]">
            <div className="flex items-center justify-center py-3 space-x-2">
              <div className="w-8 h-8 bg-[#0ba6e9] rounded-lg flex items-center text-white justify-center ">
                <Calendar style={{ height: "20px", width: "20px" }} />
              </div>
              <div className="flex flex-col  ">
                <h1 className="flex justify-center text-xl font-bold text-gray-800 ">
                  Appointege
                </h1>
                <p className="text-gray-600 text-xs">
                  Streamline Your Workflow
                </p>
              </div>
            </div>
          </div>

          {/* Auth Form Container */}
          <div className="w-full max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md mx-auto my-auto overflow-y-auto rounded-2xl shadow-md">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
