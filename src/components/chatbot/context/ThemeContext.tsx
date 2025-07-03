// contexts/ThemeContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ChatTheme } from "../../../features/chatbot/types/types";

interface ThemeContextType {
  theme: ChatTheme;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  themes: Record<string, ChatTheme>;
}

const themes: Record<string, ChatTheme> = {
  red: {
    primary: "#dc2626",
    background: "#f8fafc",
    text: "#1f2937",
    userMessage: "#3b82f6",
    botMessage: "#6b7280",
  },
  blue: {
    primary: "#2563eb",
    background: "#eff6ff",
    text: "#1e40af",
    userMessage: "#3b82f6",
    botMessage: "#64748b",
  },
  green: {
    primary: "#059669",
    background: "#f0fdf4",
    text: "#065f46",
    userMessage: "#10b981",
    botMessage: "#6b7280",
  },
  purple: {
    primary: "#7c3aed",
    background: "#faf5ff",
    text: "#581c87",
    userMessage: "#8b5cf6",
    botMessage: "#6b7280",
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>("red");

  const theme = themes[currentTheme];

  const value: ThemeContextType = {
    theme,
    currentTheme,
    setCurrentTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
