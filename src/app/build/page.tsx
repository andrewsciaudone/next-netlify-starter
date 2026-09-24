import type { Metadata } from "next";
import { Consultation } from "@/components/Consultation";
import { NextStep } from "@/components/NextStep";

export const metadata: Metadata = { title: "Build Your Uniform" };

export default function BuildPage() {
  return (
    <>
      <Consultation />
      <NextStep from={2} />
    </>
  );
}
