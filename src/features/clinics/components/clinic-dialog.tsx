"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateClinic, useUpdateClinic } from "@/features/clinics/hooks";
import { getPlansApi } from "@/features/clinics/services/clinics.service";
import type { ClinicFormValues } from "@/lib/validations/clinic";
import type { Clinic, PlanOption } from "@/features/clinics/types";
import { ClinicForm } from "./clinic-form";

interface ClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic?: Clinic | null;
}

export function ClinicDialog({ open, onOpenChange, clinic }: ClinicDialogProps) {
  const isEditing = !!clinic;
  const createMutation = useCreateClinic();
  const updateMutation = useUpdateClinic();
  const [plans, setPlans] = useState<PlanOption[]>([]);

  useEffect(() => {
    if (open && !isEditing) {
      getPlansApi({ scope: "clinic" })
        .then(setPlans)
        .catch(() => {});
    }
  }, [open, isEditing]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: ClinicFormValues) {
    if (isEditing && clinic) {
      updateMutation.mutate(
        { id: clinic.id, values },
        {
          onSuccess: () => {
            toast.success("Clínica atualizada!");
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(err.message ?? "Erro ao atualizar clínica");
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("Clínica criada!");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message ?? "Erro ao criar clínica");
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar clínica" : "Nova clínica"}</DialogTitle>
        </DialogHeader>
        <ClinicForm
          isEditing={isEditing}
          plans={isEditing ? undefined : plans}
          defaultValues={
            clinic
              ? {
                  name: clinic.name,
                  cnpj: clinic.cnpj,
                  status: clinic.status,
                  address: clinic.address ?? {
                    zip_code: "",
                    street: "",
                    number: "",
                    complement: "",
                    neighborhood: "",
                    city: "",
                    state: "",
                    country: "Brasil",
                  },
                  phone: clinic.phone,
                  media_id: clinic.media_id ?? null,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
