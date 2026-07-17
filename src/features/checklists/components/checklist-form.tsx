"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import { useCreateChecklist, useUpdateChecklist } from "@/features/checklists/hooks";
import type { ChecklistDetail, AlertSeverity, Criticality, FrequencyType } from "@/features/checklists/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MaterialIconPicker } from "@/components/shared/material-icon-picker";
import { SortableItem } from "./sortable-item";

interface ChecklistFormProps {
  checklist?: ChecklistDetail;
  onSuccess: () => void;
}

interface ItemFormState {
  id?: string;
  name: string;
  type: "text" | "boolean" | "select" | "number";
  required: boolean;
  has_observation: boolean;
  options: { id?: string; label: string; value: string }[];
  order: number;
  unit: string;
  expected_min: string;
  expected_max: string;
  target_value: string;
  alert_severity: AlertSeverity;
  criticality: Criticality;
  instructions: string;
  requires_photo: boolean;
  frequency: FrequencyType;
  scheduled_times: string[];
}

function createEmptyItem(order: number): ItemFormState {
  return {
    name: "",
    type: "text",
    required: false,
    has_observation: false,
    options: [],
    order,
    unit: "",
    expected_min: "",
    expected_max: "",
    target_value: "",
    alert_severity: "",
    criticality: "medium",
    instructions: "",
    requires_photo: false,
    frequency: "per_shift",
    scheduled_times: [],
  };
}

const ITEM_TYPES = [
  { value: "text" as const, label: "Texto" },
  { value: "boolean" as const, label: "Sim/Não" },
  { value: "select" as const, label: "Seleção" },
  { value: "number" as const, label: "Número" },
];

const CRITICALITY_OPTIONS: { value: Criticality; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

const SEVERITY_OPTIONS: { value: AlertSeverity; label: string }[] = [
  { value: "", label: "Nenhum" },
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
];

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: "as_needed", label: "Se necessário" },
  { value: "per_shift", label: "Por turno" },
  { value: "daily", label: "Diário" },
  { value: "fixed_times", label: "Horários fixos" },
];

export function ChecklistForm({ checklist, onSuccess }: ChecklistFormProps) {
  const createChecklist = useCreateChecklist();
  const updateChecklist = useUpdateChecklist(checklist?.id ?? "");

  const [name, setName] = useState(checklist?.name ?? "");
  const [icon, setIcon] = useState(checklist?.icon ?? "");
  const [isActive, setIsActive] = useState(checklist?.is_active ?? true);
  const [items, setItems] = useState<ItemFormState[]>(() => {
    if (checklist?.items?.length) {
      return checklist.items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type as ItemFormState["type"],
        required: item.required,
        has_observation: item.has_observation,
        options: item.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          value: opt.value,
        })),
        order: item.order,
        unit: item.unit ?? "",
        expected_min: item.expected_min?.toString() ?? "",
        expected_max: item.expected_max?.toString() ?? "",
        target_value: item.target_value?.toString() ?? "",
        alert_severity: item.alert_severity ?? "",
        criticality: item.criticality ?? "medium",
        instructions: item.instructions ?? "",
        requires_photo: item.requires_photo ?? false,
        frequency: item.frequency ?? "per_shift",
        scheduled_times: item.scheduled_times ?? [],
      }));
    }
    return [createEmptyItem(0)];
  });

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem(prev.length)]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<ItemFormState>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const addOption = (itemIndex: number) => {
    const item = items[itemIndex];
    if (item.type !== "select") return;
    updateItem(itemIndex, {
      options: [...item.options, { label: "", value: "" }],
    });
  };

  const removeOption = (itemIndex: number, optIndex: number) => {
    updateItem(itemIndex, {
      options: items[itemIndex].options.filter((_, i) => i !== optIndex),
    });
  };

  const updateOption = (
    itemIndex: number,
    optIndex: number,
    updates: { label?: string; value?: string }
  ) => {
    updateItem(itemIndex, {
      options: items[itemIndex].options.map((opt, i) =>
        i === optIndex ? { ...opt, ...updates } : opt
      ),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      setItems((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    const validItems = items.filter((i) => i.name.trim());
    if (validItems.length === 0) {
      toast.error("Adicione pelo menos 1 item com nome");
      return;
    }

    const body: Record<string, unknown> = {
      name: name.trim(),
      icon: icon.trim() || null,
      is_active: isActive,
      items: validItems.map((item, idx) => ({
        ...(item.id && { id: item.id }),
        name: item.name,
        type: item.type,
        required: item.required,
        has_observation: item.has_observation,
        order: idx,
        unit: item.unit || "",
        expected_min: item.expected_min || null,
        expected_max: item.expected_max || null,
        target_value: item.target_value || null,
        alert_severity: item.alert_severity || "",
        criticality: item.criticality,
        instructions: item.instructions || "",
        requires_photo: item.requires_photo,
        frequency: item.frequency,
        scheduled_times: item.scheduled_times,
        options:
          item.type === "select"
            ? item.options
                .filter((o) => o.label.trim() && o.value.trim())
                .map((o) => ({
                  ...(o.id && { id: o.id }),
                  label: o.label,
                  value: o.value,
                }))
            : [],
      })),
    };

    try {
      if (checklist?.id) {
        await updateChecklist.mutateAsync(body);
        toast.success("Template atualizado!");
      } else {
        await createChecklist.mutateAsync(body);
        toast.success("Template criado!");
      }
      onSuccess();
    } catch {
      toast.error("Erro ao salvar template");
    }
  };

  const isPending = createChecklist.isPending || updateChecklist.isPending;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome do template *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Checklist Matinal"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ícone</Label>
          <MaterialIconPicker value={icon} onChange={setIcon} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={(v) => setIsActive(v === true)}
        />
        <Label htmlFor="is_active" className="cursor-pointer font-normal">
          Ativo
        </Label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Itens do checklist *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar item
          </Button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((_, i) => String(i))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((item, index) => (
                <SortableItem key={index} id={String(index)}>
                  <div className="flex items-start gap-2">
                    <Input
                      className="flex-1"
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder={`Item ${index + 1}`}
                    />
                    <Select
                      value={item.type}
                      onValueChange={(v) =>
                        updateItem(index, {
                          type: v as ItemFormState["type"],
                          options: v === "select" ? [{ label: "", value: "" }] : [],
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          {ITEM_TYPES.find((t) => t.value === item.type)?.label ?? item.type}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`required-${index}`}
                        checked={item.required}
                        onCheckedChange={(v) => updateItem(index, { required: v === true })}
                      />
                      <Label
                        htmlFor={`required-${index}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        Obrigatório
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`obs-${index}`}
                        checked={item.has_observation}
                        onCheckedChange={(v) => updateItem(index, { has_observation: v === true })}
                      />
                      <Label
                        htmlFor={`obs-${index}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        Permite observação
                      </Label>
                    </div>
                  </div>

                  {item.type === "select" && (
                    <div className="mt-3 space-y-2 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Opções de seleção</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addOption(index)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Opção
                        </Button>
                      </div>
                      {item.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <Input
                            className="flex-1"
                            value={opt.label}
                            onChange={(e) =>
                              updateOption(index, optIndex, {
                                label: e.target.value,
                              })
                            }
                            placeholder="Label"
                          />
                          <Input
                            className="flex-1"
                            value={opt.value}
                            onChange={(e) =>
                              updateOption(index, optIndex, {
                                value: e.target.value,
                              })
                            }
                            placeholder="Valor"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index, optIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {item.options.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Clique em &ldquo;Opção&rdquo; para adicionar opções.
                        </p>
                      )}
                    </div>
                  )}

                  {item.type === "boolean" && (
                    <Badge variant="outline" className="mt-3 text-xs">
                      Sim / Não
                    </Badge>
                  )}

                  {item.type === "number" && (
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Unidade</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(index, { unit: e.target.value })}
                          placeholder="Ex: kg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Mín. esperado</Label>
                        <Input
                          type="number"
                          step="any"
                          value={item.expected_min}
                          onChange={(e) => updateItem(index, { expected_min: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Máx. esperado</Label>
                        <Input
                          type="number"
                          step="any"
                          value={item.expected_max}
                          onChange={(e) => updateItem(index, { expected_max: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Alerta</Label>
                        <Select
                          value={item.alert_severity}
                          onValueChange={(v) => updateItem(index, { alert_severity: v as AlertSeverity })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Nenhum" />
                          </SelectTrigger>
                          <SelectContent>
                            {SEVERITY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Criticalidade</Label>
                      <Select
                        value={item.criticality}
                        onValueChange={(v) => updateItem(index, { criticality: v as Criticality })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CRITICALITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Frequência</Label>
                      <Select
                        value={item.frequency}
                        onValueChange={(v) => updateItem(index, { frequency: v as FrequencyType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end pb-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`photo-${index}`}
                          checked={item.requires_photo}
                          onCheckedChange={(v) => updateItem(index, { requires_photo: v === true })}
                        />
                        <Label
                          htmlFor={`photo-${index}`}
                          className="cursor-pointer text-sm font-normal"
                        >
                          Exige foto
                        </Label>
                      </div>
                    </div>
                  </div>

                  {item.frequency === "fixed_times" && (
                    <div className="mt-2 space-y-1">
                      <Label className="text-xs">Horários (separados por vírgula, ex: 08:00,14:00)</Label>
                      <Input
                        value={item.scheduled_times.join(",")}
                        onChange={(e) =>
                          updateItem(index, {
                            scheduled_times: e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="08:00,14:00,20:00"
                      />
                    </div>
                  )}

                  <div className="mt-2">
                    <Label className="text-xs">Instruções</Label>
                    <Textarea
                      className="mt-1"
                      value={item.instructions}
                      onChange={(e) => updateItem(index, { instructions: e.target.value })}
                      placeholder="Instruções para o cuidador..."
                    />
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onSuccess} disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Salvando..." : checklist?.id ? "Salvar" : "Criar template"}
        </Button>
      </div>
    </div>
  );
}
