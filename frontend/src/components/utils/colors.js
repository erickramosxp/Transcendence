import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Yale Blue Color Utilities
export const yaleBlue = {
  // Gradient class names for easy reuse
  gradient: {
    primary: 'bg-gradient-to-r from-[#6e93c4] via-[#4a78b5] to-[#3b6091]',
    primaryHover: 'hover:from-[#4a78b5] hover:via-[#3b6091] hover:to-[#2c486d]',
    text: 'bg-gra dient-to-r from-[#4a78b5] via-[#3b6091] to-[#2c486d] bg-clip-text text-transparent',
    bg: 'bg-gradient-to-br from-[#edf2f8] via-[#dbe4f0] to-[#b7c9e1]',
    bgDark: 'dark:from-[#0a1119] dark:via-[#0f1824] dark:to-[#1e3048]',
    icon: 'bg-gradient-to-br from-[#6e93c4] via-[#4a78b5] to-[#3b6091]',
    bgLight: 'from-[#edf2f8] via-[#dbe4f0] to-[#b7c9e1]',
    hover: 'hover:from-[#edf2f8] hover:via-[#dbe4f0] hover:to-[#b7c9e1]',
    hoverDark: 'dark:hover:from-[#0a1119]/20 dark:hover:via-[#0f1824]/20 dark:hover:to-[#1e3048]/20',
  },

  // Shadow utilities
  shadow: {
    sm: 'shadow-[#4a78b5]/30',
    md: 'shadow-lg shadow-[#4a78b5]/30',
    lg: 'shadow-xl shadow-[#4a78b5]/50',
    hover: 'hover:shadow-xl hover:shadow-[#4a78b5]/40',
  },

  // Ring utilities
  ring: 'ring-[#4a78b5]/20',

  // Text colors
  text: {
    light: 'text-[#4a78b5]',
    dark: 'text-[#2c486d]',
    hover: 'hover:text-[#4a78b5]',
    like: 'hover:text-[#DD2D4A]'
  },

  // Background colors
  bg: {
    lightest: 'bg-[#edf2f8]',
    light: 'bg-[#dbe4f0]',
    main: 'bg-[#4a78b5]',
    hover: 'hover:bg-[#dbe4f0]',
    hoverDark: 'dark:hover:bg-[#1e3048]/50',
  },

  // Border colors
  border: 'border-[#4a78b5]',
};


const colors = {
  primary: "#4a78b5",
  secondary: "#6e93c4",
  accent: "#3b6091",
  background: "#edf2f8",
  surface: "#ffffff",
  border: "#dbe4f0",
  darkBackground: "#1e3048",
  darkSurface: "#0f1824",
  error: "#e53e3e",
  success: "#38a169",
  warning: "#f6e05e",
  info: "#3182ce",
  yaleBlue: {
    50: "#edf2f8",
    100: "#dbe4f0",
    200: "#b7c9e1",
    300: "#92aed3",
    400: "#6e93c4",
    500: "#4a78b5",
    600: "#3b6091",
    700: "#2c486d",
    800: "#1e3048",
    900: "#0f1824",
    950: "#0a1119",
  },
  gradients: {
    primary: "linear-gradient(90deg, #6e93c4 0%, #4a78b5 50%, #3b6091 100%)",
    background: "linear-gradient(135deg, #edf2f8 0%, #dbe4f0 50%, #b7c9e1 100%)",
  }
};

export default colors;
