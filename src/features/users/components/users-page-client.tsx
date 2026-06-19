"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Mail,
  MoreHorizontal,
  XCircle,
  Clock,
  Users,
  CheckCircle2,
  XOctagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { InviteDialog } from "./invite-dialog";
import { useInvites, useCancelInvite } from "@/features/users/hooks";
import { useUsers } from "@/features/users/hooks";
import type { InviteStatus } from "@/features/users/types";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  clinic_admin: "Admin de Clínica",
  guardian: "Responsável",
  caregiver: "Cuidador",
  family: "Familiar",
};

const STATUS_VARIANTS: Record<InviteStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "default",
  accepted: "secondary",
  expired: "outline",
  cancelled: "destructive",
};

const STATUS_LABELS: Record<InviteStatus, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  expired: "Expirado",
  cancelled: "Cancelado",
};

export function UsersPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const cancelInvite = useCancelInvite();

  const tab = searchParams.get("tab") ?? "users";
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const status = searchParams.get("status") ?? "";
  const isActive = searchParams.get("is_active") ?? "";
  const pageSize = 20;

  const invitesQuery = useInvites({ search, status, role, page, pageSize });
  const usersQuery = useUsers({ search, role, isActive, page, pageSize });

  const invites = invitesQuery.data?.invites ?? [];
  const invitesTotal = invitesQuery.data?.total ?? 0;
  const invitesTotalPages = Math.ceil(invitesTotal / pageSize);

  const users = usersQuery.data?.users ?? [];
  const usersTotal = usersQuery.data?.total ?? 0;
  const usersTotalPages = Math.ceil(usersTotal / pageSize);

  function updateParams(updates: Record<string, string>) {
    const current = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) current.set(k, v);
      else current.delete(k);
    }
    router.push(`${pathname}?${current.toString()}`);
  }

  function onTabChange(value: string) {
    const params = new URLSearchParams();
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="mt-1 text-muted-foreground">Gerencie usuários e convites da plataforma.</p>
        </div>
        {tab === "invites" && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Convidar
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={onTabChange} className="flex-col">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Mail className="mr-2 h-4 w-4" />
            Convites
          </TabsTrigger>
        </TabsList>

        {/* ── Usuários tab ─────────────────────────────────────────────── */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value, page: "" })}
              className="max-w-xs"
            />
            <Select
              value={role || "all"}
              onValueChange={(v) => {
                const val = v ?? "";
                updateParams({ role: val === "all" ? "" : val, page: "" });
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="clinic_admin">Admin de Clínica</SelectItem>
                <SelectItem value="guardian">Responsável</SelectItem>
                <SelectItem value="caregiver">Cuidador</SelectItem>
                <SelectItem value="family">Familiar</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={isActive || "all"}
              onValueChange={(v) => {
                const val = v ?? "";
                updateParams({ is_active: val === "all" ? "" : val, page: "" });
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verificação</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-36" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-8 w-8" />
                          <p>Nenhum usuário encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => router.push(`/users/${user.id}`)}
                          >
                            {user.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>{ROLE_LABELS[user.role] ?? user.role}</TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <XOctagon className="h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.role === "caregiver" && user.verification_status ? (
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
                                ? "Verificado"
                                : user.verification_status === "rejected"
                                  ? "Rejeitado"
                                  : "Pendente"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {usersTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, usersTotal)} de{" "}
                {usersTotal} usuários
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateParams({ page: String(page + 1) })}
                  disabled={page >= usersTotalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Convites tab ─────────────────────────────────────────────── */}
        <TabsContent value="invites" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Buscar por email..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value, page: "" })}
              className="max-w-xs"
            />
            <Select
              value={status || "all"}
              onValueChange={(v) => {
                const val = v ?? "";
                updateParams({ status: val === "all" ? "" : val, page: "" });
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="accepted">Aceito</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={role || "all"}
              onValueChange={(v) => {
                const val = v ?? "";
                updateParams({ role: val === "all" ? "" : val, page: "" });
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="clinic_admin">Admin de Clínica</SelectItem>
                <SelectItem value="guardian">Responsável</SelectItem>
                <SelectItem value="caregiver">Cuidador</SelectItem>
                <SelectItem value="family">Familiar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviado em</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitesQuery.isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : invites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Mail className="h-8 w-8" />
                          <p>Nenhum convite encontrado</p>
                          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                            Enviar primeiro convite
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">{invite.email}</TableCell>
                        <TableCell>{ROLE_LABELS[invite.role] ?? invite.role}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[invite.status]}>
                            {STATUS_LABELS[invite.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(invite.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {new Date(invite.expires_at) < new Date() &&
                              invite.status === "pending" && (
                                <Clock className="h-3 w-3 text-destructive" />
                              )}
                            {new Date(invite.expires_at).toLocaleDateString("pt-BR")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {invite.status === "pending" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setCancelId(invite.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar convite
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {invitesTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, invitesTotal)} de{" "}
                {invitesTotal} convites
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateParams({ page: String(page - 1) })}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateParams({ page: String(page + 1) })}
                  disabled={page >= invitesTotalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InviteDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar convite</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário convidado não poderá mais usar este link para criar a conta. Você poderá
              enviar um novo convite depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelInvite.isPending}
              onClick={() =>
                cancelInvite.mutate(cancelId!, {
                  onSuccess: () => setCancelId(null),
                })
              }
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {cancelInvite.isPending ? "Cancelando..." : "Cancelar convite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
