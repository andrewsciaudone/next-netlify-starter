import type { Metadata } from "next";
import { IssueView } from "@/components/IssueView";
import { NextStep } from "@/components/NextStep";

export const metadata: Metadata = { title: "Your Issue" };

export default function IssuePage() {
  return (
    <>
      <IssueView />
      <NextStep from={4} />
    </>
  );
}
