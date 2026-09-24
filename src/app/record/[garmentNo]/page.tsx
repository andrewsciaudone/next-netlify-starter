import type { Metadata } from "next";
import { GarmentRecord } from "@/components/GarmentRecord";

export async function generateMetadata({ params }: { params: Promise<{ garmentNo: string }> }): Promise<Metadata> {
  return { title: `Garment Record ${(await params).garmentNo}` };
}

export default async function GarmentRecordPage({ params }: { params: Promise<{ garmentNo: string }> }) {
  const { garmentNo } = await params;
  return <GarmentRecord no={decodeURIComponent(garmentNo)} />;
}
