"use client";
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeKey = "light" | "dark" | "funky";

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
    dropdown: {
      container: string,
      button: string,
    }
    dialog: {
      container: string,
      title: string,
      button: string,
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
        activeButton: "text-white border-transparent bg-indigo-500",
        inactiveButton: "text-zinc-600 bg-transparent border-transparent",
      },
    },
    components: {
      tooltip: "bg-gray-500 fill-gray-500",
      dropdown: {
        container: "border-1 border-zinc-400 backdrop-blur-lg supports-[backdrop-filter]:bg-white/25 text-zinc-400",
        button: "text-zinc-600 bg-transparent border-transparent",
      },
      dialog: {
        container: "border-1 border-zinc-400 backdrop-blur-lg supports-[backdrop-filter]:bg-white/100 text-zinc-700",
        title: "text-zinc-900",
        button: "bg-gray-900 text-white"
      },
    }
  },
  funky: {
    background: "bg-sky-500",
    cardBackground: "bg-[url('https://i.redd.it/dc8pzfnvq6wb1.png')]",
    cardBorder: "border-violet-600",
    buttonBackground: "bg-stone-800",
    buttonText: "text-neutral-900",
    text: "text-black",
    textMuted: "text-fuchsia-700",
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
        activeButton: "text-white border-transparent bg-indigo-900",
        inactiveButton: "text-zinc-600 bg-transparent border-transparent",
      },
    },
    components: {
      tooltip: "bg-gray-500 fill-gray-500",
      dropdown: {
        container: "border-1 border-zinc-400 backdrop-blur-lg supports-[backdrop-filter]:bg-white/75 text-zinc-700",
        button: "text-zinc-600 bg-transparent border-transparent",
      },
      dialog: {
        container: "border-1 border-zinc-800 backdrop-blur-lg supports-[backdrop-filter]:bg-zinc-700/10 text-zinc-300",
        title: "text-zinc-900",
        button: "bg-zinc-100 text-zinc-900"
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
        activeButton: "text-white bg-indigo-600 border-transparent hover:border-transparent transition-none",
        inactiveButton: "border-white/5 hover:border-white/50",
      },
    },
    components: {
      tooltip: "bg-gray-200 fill-gray-200 text-black",
      dropdown: {
        container: "border border-1 border-zinc-800 backdrop-blur-lg supports-[backdrop-filter]:bg-zinc-700/10 text-zinc-300",
        button: "",
      },
      dialog: {
        container: "border-1 border-zinc-800 backdrop-blur-lg supports-[backdrop-filter]:bg-zinc-700/10 text-zinc-300",
        title: "text-zinc-200",
        button: "bg-zinc-100 text-zinc-900"
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
const THEMES: Record<ThemeKey, ThemeColors> =  addTransitionColors(RAW_THEMES);

interface ThemeContextValue {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ThemeKey {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function ThemeProvider({ children, initialTheme }: { children: ReactNode; initialTheme?: ThemeKey }) {
  const [theme, setThemeState] = useState<ThemeKey>(initialTheme ?? getSystemTheme());

  useEffect(() => {
    // On mount, check cookie or fallback to system theme
    const saved = getCookie("theme") as ThemeKey | null;
    setThemeState(saved || "dark")
  }, []);

  const setTheme = (newTheme: ThemeKey) => {
    setThemeState(newTheme);
    setCookie("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: THEMES[theme] }}>
      <div
        className={`${THEMES[theme].background} ${THEMES[theme].text} min-h-screen`}
      >
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