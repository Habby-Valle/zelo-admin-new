import { ShiftsPageClient } from "@/features/shifts/components";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Turnos" };

export default function ShiftsPage() {
  return <ShiftsPageClient />;
}
