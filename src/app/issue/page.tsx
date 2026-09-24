import type { Metadata } from "next";
import { IssueView } from "@/components/IssueView";

export const metadata: Metadata = { title: "Your Issue" };

export default function IssuePage() {
  return <IssueView />;
}
