import { PatientDetailClient } from "@/features/patients/components";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Paciente" };

export default async function PatientDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <PatientDetailClient id={id} />;
}
