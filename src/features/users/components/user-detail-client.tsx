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
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/features/users/hooks";
import { UserEditDialog } from "@/features/users/components/user-edit-dialog";

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

      <UserEditDialog open={editOpen} onOpenChange={setEditOpen} user={user} />
    </div>
  );
}
