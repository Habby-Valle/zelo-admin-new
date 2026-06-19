import { PatientEditClient } from "@/features/patients/components";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar Paciente" };

export default async function EditPatientPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return <PatientEditClient id={id} />;
}
