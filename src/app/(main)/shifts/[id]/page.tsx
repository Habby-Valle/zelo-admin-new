import { use } from "react";
import { ShiftDetailClient } from "@/features/shifts/components";

interface ShiftDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ShiftDetailPage({ params }: ShiftDetailPageProps) {
  const { id } = use(params);
  return <ShiftDetailClient id={Number(id)} />;
}
