import { PatientCreateClient } from "@/features/patients/components";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Novo Paciente" };

export default function NewPatientPage() {
  return <PatientCreateClient />;
}
