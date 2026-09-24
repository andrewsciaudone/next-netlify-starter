import type { Metadata } from "next";
import { Consultation } from "@/components/Consultation";

export const metadata: Metadata = { title: "Build Your Uniform" };

export default function BuildPage() {
  return <Consultation />;
}
