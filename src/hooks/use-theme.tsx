"use client";
import React, { createContext, useContext, useState, type ReactNode } from "react";

export type ThemeKey = "light" | "dark";

interface ThemeColors {
  background: string;
  cardBackground: string;
  cardBorder: string;
  buttonBackground: string;
  buttonText: string;
  text: string;
  textMuted: string;
  nav: {
    background: string,
    link: {
      hover: string,
      normal: string
    }
  },
  editor: {
    toolbar: {
      background: string
      activeButton: string
      inactiveButton: string
    }
  }
  components: {
    tooltip: string,
    dialog: {
      container: string,
      title: string
    }
  }
}

// Original themes
const RAW_THEMES: Record<ThemeKey, ThemeColors> = {
  light: {
    background: "bg-gray-200",
    cardBackground: "bg-white",
    cardBorder: "border-gray-300",
    buttonBackground: "bg-white",
    buttonText: "text-zinc-800",
    text: "text-black",
    textMuted: "text-gray-500",
    nav: {
      background: "supports-[backdrop-filter]:bg-white/50",
      link: {
        hover: "",
        normal: ""
      }
    },
    editor: {
      toolbar: {
        background: "supports-[backdrop-filter]:bg-white/50",
        activeButton: "text-white border-transparent bg-indigo-400",
        inactiveButton: "text-zinc-600 bg-transparent border-transparent",
      },
    },
    components: {
      tooltip: "bg-gray-500 fill-gray-500",
      dialog: {
        container: "backdrop-blur-lg supports-[backdrop-filter]:bg-white/75 text-zinc-700",
        title: "text-zinc-900"
      },
    }
  },
  dark: {
    background: "bg-zinc-950",
    cardBackground: "bg-zinc-900/75",
    cardBorder: "border-zinc-800",
    buttonBackground: "bg-gray-900/75",
    buttonText: "text-white",
    text: "text-white",
    textMuted: "text-gray-400",
    nav: {
      background: "supports-[backdrop-filter]:black/25",
      link: {
        hover: "",
        normal: ""
      }
    },
    editor: {
      toolbar: {
        background: "bg-black/25 border-1 border-white/10",
        activeButton: "text-white border-transparent shadow-indigo-500/25 shadow-lg bg-indigo-800",
        inactiveButton: "border-transparent",
      },
    },
    components: {
      tooltip: "bg-gray-200 fill-gray-200 text-black",
      dialog: {
        container: "backdrop-blur-lg supports-[backdrop-filter]:bg-zinc-700/10 text-zinc-300",
        title: "text-zinc-200"
      },
    }
  },
};

// Helper function to recursively prepend transition-colors
function addTransitionColors(obj: any): any {
  if (typeof obj === "string" && obj.length > 0) {
    return `transition-colors ${obj}`;
  } else if (typeof obj === "object" && obj !== null) {
    const result: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      result[key] = addTransitionColors(obj[key]);
    }
    return result;
  }
  return obj; // for empty strings or non-strings
}

// Apply transition-colors to all theme classes
const THEMES: Record<ThemeKey, ThemeColors> = addTransitionColors(RAW_THEMES);

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
