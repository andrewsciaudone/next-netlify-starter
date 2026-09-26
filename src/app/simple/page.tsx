import type { Metadata } from "next";
import { SimpleApp } from "@/simple/SimpleApp";

export const metadata: Metadata = { title: "Shop" };

export default function SimplePage() {
  return <SimpleApp />;
}
