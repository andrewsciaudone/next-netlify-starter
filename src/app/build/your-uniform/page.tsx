import type { Metadata } from "next";
import { YourUniform } from "@/components/YourUniform";

export const metadata: Metadata = { title: "Your Uniform" };

export default function YourUniformPage() {
  return <YourUniform />;
}
