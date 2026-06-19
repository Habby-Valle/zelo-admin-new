"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCreatePatient } from "@/features/patients/hooks";
import { PatientForm } from "@/features/patients/components/patient-form";
import type { PatientFormValues } from "@/lib/validations/patient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PatientCreateClient() {
  const router = useRouter();
  const createPatient = useCreatePatient();

  function onSubmit(values: PatientFormValues) {
    const body = { ...values, email: values.email || null, cpf: values.cpf || null };
    createPatient.mutate(body, {
      onSuccess: (patient) => {
        toast.success("Paciente criado com sucesso");
        router.push(`/patients/${patient.id}`);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/patients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Paciente</h1>
          <p className="mt-1 text-muted-foreground">Cadastre um novo paciente na plataforma.</p>
        </div>
      </div>

      <PatientForm
        onSubmit={onSubmit}
        isPending={createPatient.isPending}
        error={createPatient.error?.message ?? null}
        submitLabel="Cadastrar Paciente"
      />
    </div>
  );
}
