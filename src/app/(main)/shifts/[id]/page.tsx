import { use } from "react";
import { ShiftDetailClient } from "@/features/shifts/components";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Turno" };

interface ShiftDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ShiftDetailPage({ params }: ShiftDetailPageProps) {
  const { id } = use(params);
  return <ShiftDetailClient id={Number(id)} />;
}
