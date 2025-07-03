"use client"
import React from "react";
import HeaderIndividual from "@/components/individual/header-individual";
import SidebarIndividualDesktop from "@/components/individual/sidebar-individual-desktop";
import SidebarIndividualMobile from "@/components/individual/sidebar-individual-mobile";
import { Toaster } from "@/components/ui/sonner";

interface IndividualLayoutProps {
  children: React.ReactNode;
}

const IndividualLayout: React.FC<IndividualLayoutProps> = ({ children }) => {
  return (
    // Main container for the entire page, ensures header is at the top.
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
      <HeaderIndividual /> {/* This is now the blue bar, sticky, with fixed height */}
      
      {/* Container for the sidebar and the main content area, taking remaining height */}
      <div className="flex flex-1 overflow-hidden"> 
        {/* Desktop Sidebar */}
        {/* Wrapped Sidebar in a div that can be styled for height if sidebar itself doesn't fill */}
        <div className="hidden lg:block bg-white dark:bg-slate-800 shadow-md"> 
          <SidebarIndividualDesktop />
        </div>

        {/* Mobile Sidebar (Drawer) - its own positioning handles visibility */}
        <SidebarIndividualMobile />

        {/* Main Content Area - This part will scroll if content overflows */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-4">
          <Toaster position="bottom-right" richColors closeButton />
          {/* The actual page content is rendered here */}
          <main className="flex-1 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default IndividualLayout;
