import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_FORMS, getProduct } from "@/lib/data";
import { ProductView } from "@/components/ProductView";

export function generateStaticParams() {
  return ALL_FORMS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = getProduct((await params).id);
  return { title: p ? `Uniform ${p.id} — ${p.name}` : "Uniform" };
}

export default async function UniformPage({ params }: { params: Promise<{ id: string }> }) {
  const p = getProduct((await params).id);
  if (!p) notFound();
  return <ProductView product={p} />;
}
