"use client"

import { useState, useMemo } from "react"
import { X, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const ICON_CATEGORIES = [
  {
    label: "Saúde",
    icons: ["🏥", "💊", "💉", "🩺", "🩹", "🫀", "🧠", "🦷", "👁️", "🩻", "🩼", "🧬", "🔬", "🏋️", "🧘", "😷"],
  },
  {
    label: "Cuidados",
    icons: ["🛁", "🚿", "🪥", "🧴", "🧼", "💆", "🛏️", "🍽️", "🥗", "🥤", "💧", "☕", "🍵", "🫖", "🥣", "🧃"],
  },
  {
    label: "Rotina",
    icons: ["☀️", "🌙", "🌅", "🕐", "📋", "✅", "📝", "📌", "🔔", "⏰", "🗓️", "📅", "🔄", "⚡", "🌟", "✨"],
  },
  {
    label: "Pessoas",
    icons: ["👤", "👴", "👵", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️", "🫂", "🤝", "💪", "🙏", "❤️", "💙", "💚", "💜", "🧡", "💛"],
  },
  {
    label: "Atividades",
    icons: ["🚶", "🏃", "🧗", "🎯", "🎮", "📚", "🎵", "🎨", "🌿", "🌺", "🌈", "🏡", "🚗", "✈️", "🎁", "🎉"],
  },
]

const ALL_ICONS = ICON_CATEGORIES.flatMap((cat) => cat.icons)

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return ICON_CATEGORIES
    return [
      {
        label: "Resultados",
        icons: ALL_ICONS.filter((icon) => icon.includes(search.trim())),
      },
    ]
  }, [search])

  const handleSelect = (icon: string) => {
    onChange(icon)
    setOpen(false)
    setSearch("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-start gap-2 font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value ? (
              <>
                <span className="text-xl leading-none">{value}</span>
                <span className="text-sm">Ícone selecionado</span>
                <X
                  className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50 hover:opacity-100"
                  onClick={handleClear}
                />
              </>
            ) : (
              <>
                <Smile className="h-4 w-4" />
                <span>Selecionar ícone</span>
              </>
            )}
          </Button>
        }
      />

      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <Input
            placeholder="Buscar emoji..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />

          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {filteredCategories.map((cat) =>
              cat.icons.length === 0 ? null : (
                <div key={cat.label}>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-8 gap-0.5">
                    {cat.icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleSelect(icon)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-muted",
                          value === icon && "bg-primary/10 ring-1 ring-primary"
                        )}
                        title={icon}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
            {filteredCategories.every((c) => c.icons.length === 0) && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum emoji encontrado.
              </p>
            )}
          </div>

          {value && (
            <div className="flex items-center justify-between border-t pt-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{value}</span>
                <span className="text-xs text-muted-foreground">Selecionado</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
              >
                <X className="mr-1 h-3 w-3" />
                Remover
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
