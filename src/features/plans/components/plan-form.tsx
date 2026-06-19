"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { planSchema, type PlanFormValues } from "@/lib/validations/plan";
import type { PlanBenefit } from "@/features/plans/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlanFormProps {
  defaultValues?: Partial<PlanFormValues>;
  benefits: PlanBenefit[];
  onSubmit: (values: PlanFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function PlanForm({ defaultValues, benefits, onSubmit, isLoading }: PlanFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      monthly_price: 0,
      yearly_price: null,
      scope: "clinic" as const,
      is_active: true,
      benefits: [],
      ...defaultValues,
    },
  });

  const currentBenefits = watch("benefits") ?? [];

  function getBenefitValue(benefitId: number): string {
    return currentBenefits.find((b) => b.benefit_id === benefitId)?.value ?? "";
  }

  function isBenefitEnabled(benefitId: number): boolean {
    return currentBenefits.some((b) => b.benefit_id === benefitId);
  }

  function toggleBenefit(benefitId: number, enabled: boolean) {
    if (enabled) {
      setValue("benefits", [...currentBenefits, { benefit_id: benefitId, value: "" }], {
        shouldValidate: true,
      });
    } else {
      setValue(
        "benefits",
        currentBenefits.filter((b) => b.benefit_id !== benefitId),
        { shouldValidate: true }
      );
    }
  }

  function setBenefitValue(benefitId: number, value: string) {
    setValue(
      "benefits",
      currentBenefits.map((b) => (b.benefit_id === benefitId ? { ...b, value } : b)),
      { shouldValidate: true }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-base font-semibold">Informações básicas</h3>
          <p className="text-sm text-muted-foreground">Dados gerais e identificação do plano</p>
        </div>
        <div className="space-y-5 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome do plano *</Label>
            <Input id="name" placeholder="Ex: Plano Profissional" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os benefícios e diferenciais do plano..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-base font-semibold">Escopo e preços</h3>
          <p className="text-sm text-muted-foreground">
            Defina o público-alvo e os valores de assinatura
          </p>
        </div>
        <div className="space-y-5 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="scope">Escopo do plano *</Label>
            <Select
              value={watch("scope") ?? "clinic"}
              onValueChange={(v) =>
                setValue("scope", v as "clinic" | "guardian", { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinic">Clínica</SelectItem>
                <SelectItem value="guardian">Guardião (individual)</SelectItem>
              </SelectContent>
            </Select>
            {errors.scope && <p className="text-xs text-destructive">{errors.scope.message}</p>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="monthly_price">Preço mensal (R$) *</Label>
              <Input
                id="monthly_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={watch("monthly_price") ?? ""}
                onChange={(e) =>
                  setValue("monthly_price", parseFloat(e.target.value) || 0, {
                    shouldValidate: true,
                  })
                }
              />
              {errors.monthly_price && (
                <p className="text-xs text-destructive">{errors.monthly_price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yearly_price">Preço anual (R$)</Label>
              <Input
                id="yearly_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Opcional"
                value={watch("yearly_price") ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setValue("yearly_price", val === "" ? null : parseFloat(val) || 0, {
                    shouldValidate: true,
                  });
                }}
              />
              {errors.yearly_price && (
                <p className="text-xs text-destructive">{errors.yearly_price.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                12× {watch("yearly_price") ? (Number(watch("yearly_price")) / 12).toFixed(2) : "—"}{" "}
                por mês no plano anual
              </p>
            </div>
          </div>
        </div>
      </div>

      {benefits.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <h3 className="text-base font-semibold">Benefícios</h3>
            <p className="text-sm text-muted-foreground">
              Selecione os benefícios e defina seus valores
            </p>
          </div>
          <div className="space-y-4 p-6">
            {benefits.map((benefit) => {
              const numId = Number(benefit.id);
              const enabled = isBenefitEnabled(numId);
              return (
                <div
                  key={benefit.id}
                  className="rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Switch checked={enabled} onCheckedChange={(v) => toggleBenefit(numId, v)} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{benefit.label}</p>
                      {benefit.description && (
                        <p className="text-xs text-muted-foreground">{benefit.description}</p>
                      )}
                    </div>
                  </div>
                  {enabled && (
                    <div className="mt-3 ml-10">
                      <Input
                        placeholder="Valor (ex: Ilimitado, 5GB, 10...)"
                        value={getBenefitValue(numId)}
                        onChange={(e) => setBenefitValue(numId, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h3 className="text-base font-semibold">Disponibilidade</h3>
          <p className="text-sm text-muted-foreground">
            Controle se o plano está disponível para contratação
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Switch
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
            <div>
              <Label htmlFor="is_active" className="text-sm font-medium">
                Plano ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Planos inativos não aparecem na hora da contratação
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar plano
        </Button>
      </div>
    </form>
  );
}
