import type { Metadata } from "next";
import { RecordView } from "@/components/RecordView";

export const metadata: Metadata = { title: "Your Record" };

export default function RecordPage() {
  return <RecordView />;
}
