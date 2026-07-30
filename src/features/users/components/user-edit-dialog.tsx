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

  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [cpf, setCpf] = useState(user.cpf ?? "");
  const [isActive, setIsActive] = useState(user.is_active);

  const isFamily = user.role === "family";
  const [familyMode, setFamilyMode] = useState<string | null>(user.family_mode ?? null);
  const [relationship, setRelationship] = useState(user.relationship_to_patient ?? "");

  const isCaregiver = user.role === "caregiver";
  const [professionalRegister, setProfessionalRegister] = useState(
    user.professional_register ?? ""
  );
  const [specialization, setSpecialization] = useState(user.specialization ?? "");
  const [birthDate, setBirthDate] = useState(user.birth_date ?? "");
  const [gender, setGender] = useState(user.gender ?? "");

  const isLoading = updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      email,
      name,
      phone,
      is_active: isActive,
    };
    if (cpf) payload.cpf = cpf;
    if (isFamily && familyMode !== null) payload.family_mode = familyMode;
    if (isFamily && relationship) payload.relationship_to_patient = relationship;
    if (isCaregiver && professionalRegister) payload.professional_register = professionalRegister;
    if (isCaregiver && specialization) payload.specialization = specialization;
    if (isCaregiver && birthDate) payload.birth_date = birthDate;
    if (isCaregiver && gender) payload.gender = gender;

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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
            />
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
            <>
              <div className="space-y-2">
                <Label htmlFor="professional_register">Registro profissional</Label>
                <Input
                  id="professional_register"
                  value={professionalRegister}
                  onChange={(e) => setProfessionalRegister(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de nascimento</Label>
                <Input
                  id="birth_date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="AAAA-MM-DD"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Sexo</Label>
                <Select value={gender} onValueChange={(v) => setGender(v ?? "")}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
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
