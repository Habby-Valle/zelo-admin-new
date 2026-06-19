import { Suspense } from "react";
import { PatientsPageClient } from "@/features/patients/components";

export const metadata = {
  title: "Pacientes",
};

export default function PatientsPage() {
  return (
    <Suspense fallback={null}>
      <PatientsPageClient />
    </Suspense>
  );
}
