import type { Metadata } from "next";
import { ClinicsList } from "@/features/clinics";

export const metadata: Metadata = {
  title: "Clínicas",
};

export default function ClinicsPage() {
  return <ClinicsList />;
}
