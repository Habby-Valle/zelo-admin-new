"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateUser } from "@/features/users/hooks";
import type { UserProfile } from "@/features/users/types";

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
}

export function UserEditDialog({ open, onOpenChange, user }: UserEditDialogProps) {
  const updateMutation = useUpdateUser();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [isActive, setIsActive] = useState(user.is_active);

  const isFamily = user.role === "family";
  const [familyMode, setFamilyMode] = useState<string | null>(null);
  const [relationship, setRelationship] = useState("");

  const isCaregiver = user.role === "caregiver";
  const [professionalRegister, setProfessionalRegister] = useState("");

  const isLoading = updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = { name, phone, is_active: isActive };
    if (isFamily && familyMode !== null) payload.family_mode = familyMode;
    if (isFamily && relationship) payload.relationship_to_patient = relationship;
    if (isCaregiver && professionalRegister) payload.professional_register = professionalRegister;

    updateMutation.mutate(
      { id: user.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Usuário atualizado!");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message ?? "Erro ao atualizar usuário");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="is_active">Usuário ativo</Label>
          </div>

          {isFamily && (
            <>
              <div className="space-y-2">
                <Label htmlFor="family_mode">Modo</Label>
                <Select value={familyMode ?? ""} onValueChange={(v) => setFamilyMode(v)}>
                  <SelectTrigger id="family_mode">
                    <SelectValue placeholder="Selecionar modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="direct">Direto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Parentesco</Label>
                <Input
                  id="relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="Ex: Filho(a)"
                />
              </div>
            </>
          )}

          {isCaregiver && (
            <div className="space-y-2">
              <Label htmlFor="professional_register">Registro profissional</Label>
              <Input
                id="professional_register"
                value={professionalRegister}
                onChange={(e) => setProfessionalRegister(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
