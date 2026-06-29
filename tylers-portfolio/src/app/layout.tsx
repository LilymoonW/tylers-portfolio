import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { fontClassNames } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Tyler Yoon",
  description:
    "Portfolio of Tyler Yoon — VFX editor specializing in visual effects, motion graphics, and creative video editing.",
  icons: {
    icon: [
      { url: "/favicon-circle-v2.ico", type: "image/x-icon" },
      { url: "/favicon-circle-v2-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-circle-v2-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-circle-v2.png", type: "image/png", sizes: "216x216" },
    ],
    apple: [
      { url: "/apple-touch-icon-circle-v2.png", type: "image/png", sizes: "216x216" },
      { url: "/apple-icon-circle-v2.png", type: "image/png", sizes: "216x216" },
    ],
    shortcut: ["/favicon-circle-v2.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontClassNames} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
