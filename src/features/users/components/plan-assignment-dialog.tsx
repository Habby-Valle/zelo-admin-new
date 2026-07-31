"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignFamilyPlan } from "@/features/users/hooks";
import { getPlansApi } from "@/features/clinics/services/clinics.service";
import type { PlanOption } from "@/features/clinics/types";

interface PlanAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentPlanId?: string | null;
}

export function PlanAssignmentDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentPlanId,
}: PlanAssignmentDialogProps) {
  const assignMutation = useAssignFamilyPlan();
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(currentPlanId ?? null);

  // Sincroniza a seleção com o plano atual sem setState em effect (evita cascading renders).
  const [prevCurrentPlanId, setPrevCurrentPlanId] = useState(currentPlanId);
  if (currentPlanId !== prevCurrentPlanId) {
    setPrevCurrentPlanId(currentPlanId);
    if (currentPlanId) setSelectedPlanId(currentPlanId);
  }

  useEffect(() => {
    if (open) {
      getPlansApi({ scope: "family" })
        .then(setPlans)
        .catch(() => toast.error("Erro ao carregar planos"));
    }
  }, [open]);

  const handleAssign = () => {
    if (!selectedPlanId) {
      toast.error("Selecione um plano");
      return;
    }
    assignMutation.mutate(
      { familyId: userId, planId: selectedPlanId },
      {
        onSuccess: (data) => {
          toast.success(`Plano ${data.plan_name} atribuído a ${userName}`);
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message ?? "Erro ao atribuir plano");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir plano — {userName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Plano</Label>
            <Select value={selectedPlanId ?? ""} onValueChange={(v) => setSelectedPlanId(v)}>
              <SelectTrigger id="plan">
                <SelectValue placeholder="Selecionar plano">
                  {selectedPlanId ? plans.find((p) => p.id === selectedPlanId)?.name : ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={assignMutation.isPending}>
              {assignMutation.isPending ? "Atribuindo..." : "Atribuir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
