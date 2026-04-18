import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/CustomCursor";
import GrainOverlay from "@/components/GrainOverlay";
import { fontClassNames } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Tyler Yoon | VFX Editor",
  description:
    "Portfolio of Tyler Yoon — VFX editor specializing in visual effects, motion graphics, and creative video editing.",
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
          <GrainOverlay />
          <CustomCursor />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
