import localFont from "next/font/local";

/**
 * Centralized font config.
 * Change families/options here to update fonts app-wide.
 */
export const displayFont = localFont({
  src: "../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--font-bebas-neue",
});

export const bodyFont = localFont({
  src: "../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--font-dm-sans",
});

export const fontClassNames = `${displayFont.variable} ${bodyFont.variable}`;
