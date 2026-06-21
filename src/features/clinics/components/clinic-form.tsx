"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { clinicSchema, type ClinicFormValues } from "@/lib/validations/clinic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCnpjInput, formatPhone, formatCep } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlanOption } from "@/features/clinics/types";

interface ClinicFormProps {
  defaultValues?: Partial<ClinicFormValues>;
  onSubmit: (values: ClinicFormValues) => Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
  plans?: PlanOption[];
}

const EMPTY_ADDRESS = {
  zip_code: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "Brasil",
};

export function ClinicForm({
  defaultValues,
  onSubmit,
  isLoading,
  isEditing = false,
  plans,
}: ClinicFormProps) {
  const [cepLoading, setCepLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema) as any,
    defaultValues: {
      name: "",
      cnpj: "",
      status: "active",
      address: EMPTY_ADDRESS,
      phone: "",
      media_id: null,
      ...defaultValues,
    },
  });

  const cnpjValue = watch("cnpj") ?? "";
  const statusValue = watch("status");
  const cepValue = watch("address.zip_code") ?? "";
  const selectedPlanId = watch("plan_id");

  async function handleFormSubmit(values: ClinicFormValues) {
    await onSubmit(values);
  }

  async function handleCepSearch() {
    const digits = cepValue.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.erro) return;
      setValue("address.street", data.logradouro, { shouldValidate: true });
      setValue("address.neighborhood", data.bairro, { shouldValidate: true });
      setValue("address.city", data.localidade, { shouldValidate: true });
      setValue("address.state", data.uf, { shouldValidate: true });
    } finally {
      setCepLoading(false);
    }
  }

  const ae = errors.address;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" placeholder="Clínica Bem Estar" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            placeholder="00.000.000/0000-00"
            value={formatCnpjInput(cnpjValue)}
            onChange={(e) => setValue("cnpj", e.target.value, { shouldValidate: true })}
          />
          {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            placeholder="(11) 99999-9999"
            value={formatPhone(watch("phone") ?? "")}
            onChange={(e) => setValue("phone", e.target.value, { shouldValidate: true })}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label>Status *</Label>
        <Select
          value={statusValue}
          onValueChange={(v) =>
            setValue("status", v as ClinicFormValues["status"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {statusValue === "active" ? "Ativa" : statusValue === "inactive" ? "Inativa" : "Suspensa"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="inactive">Inativa</SelectItem>
            <SelectItem value="suspended">Suspensa</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
      </div>

      <div className="rounded-lg border p-3">
        <p className="mb-2 text-sm font-medium">Endereço</p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">CEP</Label>
              <div className="flex gap-1">
                <Input
                  placeholder="00000-000"
                  value={formatCep(cepValue)}
                  onChange={(e) =>
                    setValue("address.zip_code", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCepSearch}
                  disabled={cepValue.replace(/\D/g, "").length !== 8 || cepLoading}
                  title="Buscar CEP"
                >
                  {cepLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {ae?.zip_code && <p className="text-xs text-destructive">{ae.zip_code.message}</p>}
            </div>
            <div className="w-24 space-y-1">
              <Label className="text-xs">Nº</Label>
              <Input placeholder="123" {...register("address.number")} />
              {ae?.number && <p className="text-xs text-destructive">{ae.number.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Logradouro</Label>
            <Input placeholder="Rua das Flores" {...register("address.street")} />
            {ae?.street && <p className="text-xs text-destructive">{ae.street.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Bairro</Label>
              <Input placeholder="Centro" {...register("address.neighborhood")} />
              {ae?.neighborhood && (
                <p className="text-xs text-destructive">{ae.neighborhood.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cidade</Label>
              <Input placeholder="São Paulo" {...register("address.city")} />
              {ae?.city && <p className="text-xs text-destructive">{ae.city.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">UF</Label>
              <Input
                placeholder="SP"
                maxLength={2}
                {...register("address.state")}
                onChange={(e) =>
                  setValue("address.state", e.target.value.toUpperCase(), {
                    shouldValidate: true,
                  })
                }
              />
              {ae?.state && <p className="text-xs text-destructive">{ae.state.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Complemento</Label>
            <Input placeholder="Sala 5 (opcional)" {...register("address.complement")} />
          </div>
        </div>
      </div>

      {!isEditing && plans && plans.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Plano de Assinatura</Label>
          <div className="grid grid-cols-2 gap-2">
            {plans.map((plan) => {
              const sel = selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() =>
                    setValue("plan_id", sel ? null : plan.id, {
                      shouldValidate: true,
                    })
                  }
                  className={`relative rounded-lg border p-3 text-left transition-all hover:border-primary ${
                    sel ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                  }`}
                >
                  {sel && (
                    <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                      ✓
                    </div>
                  )}
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <p className="text-lg font-bold">
                    R$ {plan.monthly_price}
                    <span className="text-xs font-normal text-muted-foreground">/mês</span>
                  </p>
                  {plan.benefits.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {plan.benefits.slice(0, 3).map((b) => (
                        <li key={b.benefit_key} className="text-xs text-muted-foreground">
                          ✓ {b.benefit_label}
                        </li>
                      ))}
                      {plan.benefits.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{plan.benefits.length - 3} mais
                        </li>
                      )}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>
          {selectedPlanId === null && (
            <p className="text-xs text-muted-foreground">Sem plano definido</p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Salvar alterações" : "Criar clínica"}
      </Button>
    </form>
  );
}
