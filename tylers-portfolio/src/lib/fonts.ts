import localFont from "next/font/local";

/** One variable font file — display + body share a single download. */
const interVariable = localFont({
  src: "../../public/fonts/Inter-VariableFont_opsz-wght.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter-variable",
});

export const displayFont = interVariable;
export const bodyFont = interVariable;
export const fontClassNames = interVariable.variable;
