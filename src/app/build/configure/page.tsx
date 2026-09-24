import type { Metadata } from "next";
import { Configurator } from "@/components/Configurator";

export const metadata: Metadata = { title: "Uniform Configurator" };

export default function ConfigurePage() {
  return <Configurator />;
}
