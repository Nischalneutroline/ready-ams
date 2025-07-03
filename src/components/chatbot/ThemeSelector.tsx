// components/ThemeSelector.tsx
"use client";

import { useTheme } from "./context/ThemeContext";

const ThemeSelector: React.FC = () => {
  const { currentTheme, setCurrentTheme, themes } = useTheme();

  return (
    <div className="flex space-x-2 p-4">
      <span className="text-sm font-medium text-gray-700 mr-2">Theme:</span>
      {Object.keys(themes).map((themeName: string) => (
        <button
          key={themeName}
          onClick={() => setCurrentTheme(themeName)}
          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
            currentTheme === themeName
              ? "border-gray-800 ring-2 ring-gray-300"
              : "border-gray-300"
          }`}
          style={{ backgroundColor: themes[themeName].primary }}
          title={`${
            themeName.charAt(0).toUpperCase() + themeName.slice(1)
          } theme`}
          type="button"
        />
      ))}
    </div>
  );
};

export default ThemeSelector;
