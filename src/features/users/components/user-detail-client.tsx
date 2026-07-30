"use client";

import { useState } from "react";
import { useRouter, notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  UserCircle2,
  CheckCircle2,
  XOctagon,
  CalendarDays,
  Shield,
  Pencil,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/features/users/hooks";
import { UserEditDialog } from "@/features/users/components/user-edit-dialog";
import { PlanAssignmentDialog } from "@/features/users/components/plan-assignment-dialog";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  clinic_admin: "Admin de Clínica",
  caregiver: "Cuidador",
  family: "Familiar",
};

interface UserDetailClientProps {
  id: string;
}

export default function UserDetailClient({ id }: UserDetailClientProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser(id);
  const [editOpen, setEditOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (isError || !user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/users?tab=users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.media?.url ?? undefined} alt={user.name} />
          <AvatarFallback className="text-base">
            {user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <Badge variant="outline">{ROLE_LABELS[user.role] ?? user.role}</Badge>
            {user.is_active ? (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Ativo
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <XOctagon className="h-3 w-3" />
                Inativo
              </Badge>
            )}
            {user.role === "caregiver" && user.verification_status && (
              <Badge
                variant={
                  user.verification_status === "approved"
                    ? "default"
                    : user.verification_status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
                className="gap-1"
              >
                {user.verification_status === "approved"
                  ? "Verificado"
                  : user.verification_status === "rejected"
                    ? "Rejeitado"
                    : "Pendente"}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Telefone</span>
            <span>{user.phone || "—"}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <UserCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Perfil</span>
            <span>{ROLE_LABELS[user.role] ?? user.role}</span>
          </div>

          {user.role === "caregiver" && user.verification_status && (
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Verificação</span>
              <Badge
                variant={
                  user.verification_status === "approved"
                    ? "default"
                    : user.verification_status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {user.verification_status === "approved"
                  ? "Aprovado"
                  : user.verification_status === "rejected"
                    ? "Rejeitado"
                    : "Pendente"}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Criado em</span>
            <span>
              {new Date(user.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {user.role === "family" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Plano</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setPlanOpen(true)}>
              <CreditCard className="mr-1 h-4 w-4" />
              Atribuir plano
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.family_plan ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="font-medium">{user.family_plan.plan_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{user.family_plan.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pacientes</span>
                  <span>
                    {user.family_plan.max_patients === -1
                      ? "Ilimitado"
                      : `Até ${user.family_plan.max_patients}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cuidadores</span>
                  <span>
                    {user.family_plan.max_caregivers === -1
                      ? "Ilimitado"
                      : `Até ${user.family_plan.max_caregivers}`}
                  </span>
                </div>
                {user.family_plan.start_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Início</span>
                    <span>
                      {new Date(user.family_plan.start_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {user.family_mode === "direct"
                  ? "Familiar em modo direto sem plano atribuído."
                  : user.family_mode === "clinic"
                    ? "Familiar vinculado a uma clínica."
                    : "Familiar sem modo definido."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <UserEditDialog open={editOpen} onOpenChange={setEditOpen} user={user} />
      {user.role === "family" && (
        <PlanAssignmentDialog
          open={planOpen}
          onOpenChange={setPlanOpen}
          userId={user.id}
          userName={user.name}
          currentPlanId={user.family_plan?.plan_id}
        />
      )}
    </div>
  );
}
