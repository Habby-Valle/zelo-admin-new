"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useCreatePatient, usePatient, useUpdatePatient } from "@/features/patients/hooks";
import { PatientForm } from "@/features/patients/components/patient-form";
import type { PatientFormValues } from "@/lib/validations/patient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function PatientCreateClient() {
  const router = useRouter();
  const createMutation = useCreatePatient();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: PatientFormValues) => {
    setError(null);
    try {
      await createMutation.mutateAsync({
        name: values.name,
        birth_date: values.birth_date,
        gender: values.gender,
        cpf: values.cpf || null,
        phone: values.phone,
        email: values.email || null,
        clinic_id: values.clinic_id ?? null,
        blood_type: values.blood_type ?? null,
        health_conditions: values.health_conditions ?? "",
        allergies: values.allergies ?? "",
        medications: values.medications ?? "",
        observations: values.observations ?? "",
        media_id: values.media_id ?? null,
      });
      toast.success("Paciente criado com sucesso");
      router.push("/patients");
    } catch {
      setError("Erro ao criar paciente");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/patients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Paciente</h1>
      </div>
      <PatientForm
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
        error={error}
        submitLabel="Criar Paciente"
      />
    </div>
  );
}

export function PatientEditClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: patient, isLoading } = usePatient(id);
  const updateMutation = useUpdatePatient();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: PatientFormValues) => {
    setError(null);
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: values.name,
          birth_date: values.birth_date,
          gender: values.gender,
          cpf: values.cpf || null,
          phone: values.phone,
          email: values.email || null,
          clinic_id: values.clinic_id ?? null,
          blood_type: values.blood_type ?? null,
          health_conditions: values.health_conditions ?? "",
          allergies: values.allergies ?? "",
          medications: values.medications ?? "",
          observations: values.observations ?? "",
          media_id: values.media_id ?? null,
        },
      });
      toast.success("Paciente atualizado com sucesso");
      router.push(`/patients/${id}`);
    } catch {
      setError("Erro ao atualizar paciente");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
        <Button onClick={() => router.push("/patients")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/patients/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Editar Paciente</h1>
      </div>
      <PatientForm
        defaultValues={{
          name: patient.name,
          birth_date: patient.birth_date,
          gender: patient.gender,
          cpf: patient.cpf,
          phone: patient.phone,
          email: patient.email,
          clinic_id: patient.clinic_id ? Number(patient.clinic_id) : null,
          blood_type: patient.blood_type,
          health_conditions: patient.health_conditions,
          allergies: patient.allergies,
          medications: patient.medications,
          observations: patient.observations,
          media_id: patient.media_id,
        }}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
        error={error}
        submitLabel="Salvar Alterações"
      />
    </div>
  );
}
