"use client";

import { useState, useMemo } from "react";
import { X, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./material-icon";

const ICON_CATEGORIES = [
  {
    label: "Higiene e Cuidados",
    icons: ["wash", "shower", "bathtub", "soap", "clean_hands", "sanitizer", "dry_cleaning"],
  },
  {
    label: "Saúde e Monitoramento",
    icons: [
      "medication",
      "vaccines",
      "healing",
      "monitor_heart",
      "thermostat",
      "bloodtype",
      "medical_services",
      "local_hospital",
      "health_and_safety",
      "stethoscope",
    ],
  },
  {
    label: "Alimentação e Hidratação",
    icons: [
      "restaurant",
      "lunch_dining",
      "local_cafe",
      "water_drop",
      "emoji_food_beverage",
      "food_bank",
      "nutrition",
      "blender",
    ],
  },
  {
    label: "Mobilidade e Exercícios",
    icons: [
      "directions_walk",
      "accessibility",
      "elderly",
      "sports_gymnastics",
      "self_improvement",
      "wheelchair_pickup",
      "hiking",
    ],
  },
  {
    label: "Sono e Repouso",
    icons: ["bedtime", "bed", "nightlight", "nights_stay", "hotel", "dark_mode"],
  },
  {
    label: "Eliminações",
    icons: ["wc", "water", "opacity", "invert_colors", "recycling"],
  },
  {
    label: "Pele e Feridas",
    icons: ["bandage", "colorize", "brush", "spa", "grass"],
  },
  {
    label: "Geral",
    icons: [
      "checklist",
      "task_alt",
      "assignment",
      "fact_check",
      "playlist_add_check",
      "note_alt",
      "pending_actions",
      "event_available",
    ],
  },
];

const ALL_ICONS = ICON_CATEGORIES.flatMap((cat) => cat.icons);

interface MaterialIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function MaterialIconPicker({ value, onChange }: MaterialIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return ICON_CATEGORIES;
    const q = search.trim().toLowerCase();
    return [
      {
        label: "Resultados",
        icons: ALL_ICONS.filter((icon) => icon.includes(q)),
      },
    ];
  }, [search]);

  const handleSelect = (icon: string) => {
    onChange(icon);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

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
                <MaterialIcon name={value} size="sm" />
                <span className="text-sm">{value}</span>
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
            placeholder="Buscar ícone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />

          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {filteredCategories.map((cat) =>
              cat.icons.length === 0 ? null : (
                <div key={cat.label}>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">{cat.label}</p>
                  <div className="grid grid-cols-8 gap-0.5">
                    {cat.icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleSelect(icon)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-muted",
                          value === icon && "bg-primary/10 ring-1 ring-primary"
                        )}
                        title={icon}
                      >
                        <MaterialIcon name={icon} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
            {filteredCategories.every((c) => c.icons.length === 0) && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum ícone encontrado.
              </p>
            )}
          </div>

          {value && (
            <div className="flex items-center justify-between border-t pt-2">
              <div className="flex items-center gap-2">
                <MaterialIcon name={value} size="md" />
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  onChange("");
                  setOpen(false);
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
  );
}
