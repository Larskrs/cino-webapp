"use client";
import React, { createContext, useContext, useState, type ReactNode } from "react";

export type ThemeKey = "light" | "dark" | "solarized";

interface ThemeColors {
  background: string;
  cardBackground: string;
  cardBorder: string;
  buttonBackground: string;
  buttonText: string;
  text: string;
  textMuted: string;
}

const THEMES: Record<ThemeKey, ThemeColors> = {
  light: {
    background: "bg-gray-200",
    cardBackground: "bg-white",
    cardBorder: "border-gray-300",
    buttonBackground: "bg-white",
    buttonText: "text-zinc-800",
    text: "text-black",
    textMuted: "text-gray-500",
  },
  dark: {
    background: "bg-gray-950",
    cardBackground: "bg-gray-900/75",
    cardBorder: "border-gray-700",
    buttonBackground: "bg-gray-900/75",
    buttonText: "text-white",
    text: "text-white",
    textMuted: "text-gray-400",
  },
  solarized: {
    background: "bg-[#fdf6e3]",
    cardBackground: "bg-[#eee8d5]",
    cardBorder: "border-[#93a1a1]",
    buttonBackground: "bg-zinc-950",
    buttonText: "text-white",
    text: "text-[#657b83]",
    textMuted: "text-[#93a1a1]",
  },
};

interface ThemeContextValue {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeKey>("dark");
  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: THEMES[theme] }}>
      <div className={`${THEMES[theme].background} ${THEMES[theme].text} min-h-screen`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
