import type { Metadata } from "next";
import { NextStep } from "@/components/NextStep";
import { RecordView } from "@/components/RecordView";

export const metadata: Metadata = { title: "Uniform Record" };

export default function RecordPage() {
  return (
    <>
      <RecordView />
      <NextStep from={3} />
    </>
  );
}
