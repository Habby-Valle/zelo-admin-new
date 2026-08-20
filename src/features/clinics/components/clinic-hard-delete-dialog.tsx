"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { useClinicDeletionImpact, useDeleteClinic } from "@/features/clinics/hooks";
import type { Clinic, ClinicDeletionImpact } from "@/features/clinics/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DELETED_LABELS: Record<keyof ClinicDeletionImpact["deleted"], string> = {
  patients: "pacientes",
  shifts: "turnos",
  care_plans: "planos de cuidado",
  checklists: "checklists",
  invites: "convites",
  sos_alerts: "alertas de SOS",
  service_contracts: "contratos",
  service_invoices: "faturas",
  clinic_admins: "admins da clínica",
  nurses: "enfermeiros",
  users: "contas de acesso",
};

const UNLINKED_LABELS: Record<keyof ClinicDeletionImpact["unlinked"], string> = {
  caregivers: "cuidadores",
  family_members: "familiares",
};

function summarize(counts: Record<string, number>, labels: Record<string, string>): string[] {
  return Object.entries(counts)
    .filter(([, total]) => total > 0)
    .map(([key, total]) => `${total} ${labels[key] ?? key}`);
}

interface ClinicHardDeleteDialogProps {
  /** A lista passa `key={clinic?.id}`: cada clínica remonta o diálogo com o campo limpo. */
  clinic: Clinic | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Confirmação da exclusão permanente.
 *
 * Duas travas de propósito: a prévia mostra o que vai junto (a clínica é a raiz
 * do tenant, então "só a clínica" quase nunca é verdade) e o nome tem que ser
 * digitado à mão, para que a ação não caiba num clique errado.
 */
export function ClinicHardDeleteDialog({ clinic, onOpenChange }: ClinicHardDeleteDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const impactQuery = useClinicDeletionImpact(clinic?.id ?? null);
  const deleteMutation = useDeleteClinic();

  const impact = impactQuery.data;
  const deletedItems = impact ? summarize(impact.deleted, DELETED_LABELS) : [];
  const unlinkedItems = impact ? summarize(impact.unlinked, UNLINKED_LABELS) : [];
  const nameMatches = confirmation.trim() === clinic?.name.trim();

  const handleDelete = () => {
    if (!clinic || !nameMatches) return;
    deleteMutation.mutate(
      { id: clinic.id, permanent: true },
      {
        onSuccess: () => {
          toast.success(`Clínica "${clinic.name}" excluída permanentemente.`);
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message ?? "Erro ao excluir permanentemente");
        },
      }
    );
  };

  return (
    <AlertDialog open={!!clinic} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Excluir permanentemente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            A clínica <strong>{clinic?.name}</strong> será apagada do banco de dados. Não há como
            desfazer — nem pela interface, nem pelo suporte.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground">
          {impactQuery.isLoading && <p>Calculando o que será removido…</p>}

          {impact && deletedItems.length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3">
              <p className="font-medium">Será apagado junto:</p>
              <ul className="mt-1 list-inside list-disc">
                {deletedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {impact && deletedItems.length === 0 && (
            <p>Nenhum registro depende desta clínica — só a própria clínica será apagada.</p>
          )}

          {unlinkedItems.length > 0 && (
            <p>
              Continuam existindo, apenas sem vínculo com a clínica: {unlinkedItems.join(", ")}.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-clinic-name">
            Digite <strong>{clinic?.name}</strong> para confirmar
          </Label>
          <Input
            id="confirm-clinic-name"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={clinic?.name}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={!nameMatches || deleteMutation.isPending}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Excluindo…" : "Excluir permanentemente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
