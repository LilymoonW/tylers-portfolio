"use client";

import IntroGate from "@/components/IntroGate";
import IntroWaveDivider from "@/components/IntroWaveDivider";
import ScrollNav from "@/components/ScrollNav";
import { IntroScrollProvider } from "@/components/providers/IntroScrollProvider";

export default function HomeIntro() {
  return (
    <IntroScrollProvider>
      <IntroGate />
      <IntroWaveDivider />
      <ScrollNav />
    </IntroScrollProvider>
  );
}
