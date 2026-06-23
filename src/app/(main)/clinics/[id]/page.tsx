import type { Metadata } from "next";
import { ClinicDetailView } from "@/features/clinics";

export const metadata: Metadata = {
  title: "Detalhes da Clínica",
};

export default async function ClinicDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <ClinicDetailView id={id} />;
}
