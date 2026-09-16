import localFont from "next/font/local";

/**
 * One variable font file (opsz + wght axes), Latin subset, WOFF2 — display + body
 * share a single ~97 KB download. next/font copies it into the build with a content
 * hash, so the source lives in `src/assets`, not `public/`.
 */
const interVariable = localFont({
  src: "../assets/fonts/inter-variable-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter-variable",
  display: "swap",
});

export const fontClassNames = interVariable.variable;
