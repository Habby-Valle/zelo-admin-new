"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

import { useCreateChecklist, useUpdateChecklist } from "@/features/checklists/hooks"
import { useClinics } from "@/features/clinics/hooks"
import type { ChecklistDetail } from "@/features/checklists/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MaterialIconPicker } from "@/components/shared/material-icon-picker"
import { SortableItem } from "./sortable-item"

interface ChecklistFormProps {
  checklist?: ChecklistDetail
  onSuccess: () => void
}

interface ItemFormState {
  id?: string
  name: string
  type: "text" | "boolean" | "select" | "number"
  required: boolean
  has_observation: boolean
  options: { id?: string; label: string; value: string }[]
  order: number
}

function createEmptyItem(order: number): ItemFormState {
  return {
    name: "",
    type: "text",
    required: false,
    has_observation: false,
    options: [],
    order,
  }
}

const ITEM_TYPES = [
  { value: "text" as const, label: "Texto" },
  { value: "boolean" as const, label: "Sim/Não" },
  { value: "select" as const, label: "Seleção" },
  { value: "number" as const, label: "Número" },
]

export function ChecklistForm({ checklist, onSuccess }: ChecklistFormProps) {
  const { data: clinicsData } = useClinics({ pageSize: 999 })
  const clinics = clinicsData?.results ?? []

  const createChecklist = useCreateChecklist()
  const updateChecklist = useUpdateChecklist(checklist?.id ?? 0)

  const [name, setName] = useState(checklist?.name ?? "")
  const [icon, setIcon] = useState(checklist?.icon ?? "")
  const [clinicId, setClinicId] = useState<string>(checklist?.clinic_id ? String(checklist.clinic_id) : "")
  const [isActive, setIsActive] = useState(checklist?.is_active ?? true)
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
      }))
    }
    return [createEmptyItem(0)]
  })

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem(prev.length)])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updates: Partial<ItemFormState>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  const addOption = (itemIndex: number) => {
    const item = items[itemIndex]
    if (item.type !== "select") return
    updateItem(itemIndex, {
      options: [...item.options, { label: "", value: "" }],
    })
  }

  const removeOption = (itemIndex: number, optIndex: number) => {
    updateItem(itemIndex, {
      options: items[itemIndex].options.filter((_, i) => i !== optIndex),
    })
  }

  const updateOption = (
    itemIndex: number,
    optIndex: number,
    updates: { label?: string; value?: string }
  ) => {
    updateItem(itemIndex, {
      options: items[itemIndex].options.map((opt, i) =>
        i === optIndex ? { ...opt, ...updates } : opt
      ),
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id)
      const newIndex = Number(over.id)
      setItems((prev) => arrayMove(prev, oldIndex, newIndex))
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }
    const validItems = items.filter((i) => i.name.trim())
    if (validItems.length === 0) {
      toast.error("Adicione pelo menos 1 item com nome")
      return
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
    }
    if (clinicId) body.clinic_id = Number(clinicId)

    try {
      if (checklist?.id) {
        await updateChecklist.mutateAsync(body)
        toast.success("Template atualizado!")
      } else {
        await createChecklist.mutateAsync(body)
        toast.success("Template criado!")
      }
      onSuccess()
    } catch {
      toast.error("Erro ao salvar template")
    }
  }

  const isPending = createChecklist.isPending || updateChecklist.isPending

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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Clínica</Label>
          <Select
            value={clinicId || "none"}
            onValueChange={(v) => setClinicId(v === "none" ? "" : v ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Global (sem clínica)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Global (sem clínica)</SelectItem>
              {clinics.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                      onChange={(e) =>
                        updateItem(index, { name: e.target.value })
                      }
                      placeholder={`Item ${index + 1}`}
                    />
                    <Select
                      value={item.type}
                      onValueChange={(v) =>
                        updateItem(index, {
                          type: v as ItemFormState["type"],
                          options:
                            v === "select" ? [{ label: "", value: "" }] : [],
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
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

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`required-${index}`}
                        checked={item.required}
                        onCheckedChange={(v) =>
                          updateItem(index, { required: v === true })
                        }
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
                        onCheckedChange={(v) =>
                          updateItem(index, { has_observation: v === true })
                        }
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
                    <div className="space-y-2 pl-4 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Opções de seleção
                        </span>
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
                    <Badge variant="outline" className="text-xs mt-3">
                      Sim / Não
                    </Badge>
                  )}
                  {item.type === "number" && (
                    <Badge variant="outline" className="text-xs mt-3">
                      123
                    </Badge>
                  )}
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
          {isPending
            ? "Salvando..."
            : checklist?.id
              ? "Salvar"
              : "Criar template"}
        </Button>
      </div>
    </div>
  )
}
