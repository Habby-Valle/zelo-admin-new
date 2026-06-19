"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  PowerOff,
  Plus,
  Trash2,
  LogIn,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useClinics, useDeactivateClinic, useDeleteClinic } from "@/features/clinics/hooks";
import type { Clinic, ClinicStatus } from "@/features/clinics/types";
import { ClinicDialog } from "./clinic-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCnpj } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const STATUS_MAP: Record<
  ClinicStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Ativa", variant: "default" },
  inactive: { label: "Inativa", variant: "secondary" },
  suspended: { label: "Suspensa", variant: "destructive" },
};

export function ClinicsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClinicStatus | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useClinics({ search, status, page, pageSize });
  const deactivateMutation = useDeactivateClinic();
  const deleteMutation = useDeleteClinic();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClinic, setEditClinic] = useState<Clinic | undefined>();
  const [deactivateTarget, setDeactivateTarget] = useState<Clinic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Clinic | null>(null);

  const openCreate = () => {
    setEditClinic(undefined);
    setDialogOpen(true);
  };

  const openEdit = (clinic: Clinic) => {
    setEditClinic(clinic);
    setDialogOpen(true);
  };

  const handleDeactivate = useCallback(() => {
    if (!deactivateTarget) return;
    deactivateMutation.mutate(deactivateTarget.id, {
      onSuccess: () => {
        toast.success(`Clínica "${deactivateTarget.name}" desativada.`);
        setDeactivateTarget(null);
      },
      onError: (err) => {
        toast.error(err.message ?? "Erro ao desativar");
        setDeactivateTarget(null);
      },
    });
  }, [deactivateTarget, deactivateMutation]);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`Clínica "${deleteTarget.name}" excluída.`);
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err.message ?? "Erro ao excluir");
        setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteMutation]);

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clínicas</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie todas as clínicas cadastradas na plataforma.
          </p>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">Erro ao carregar lista de clínicas.</p>
        </div>
      </div>
    );
  }

  const total = data?.count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clínicas</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie todas as clínicas cadastradas na plataforma.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar clínica..."
            className="max-w-xs"
          />
          <Select
            value={status}
            onValueChange={(v) => {
              if (v) setStatus(v as ClinicStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
              <SelectItem value="suspended">Suspensas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nova clínica
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Nenhuma clínica encontrada.
                </TableCell>
              </TableRow>
            ) : (
              data?.results?.map((clinic) => {
                const s = STATUS_MAP[clinic.status] ?? {
                  label: clinic.status,
                  variant: "outline" as const,
                };
                return (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/clinics/${clinic.id}`}
                        className="flex items-center gap-2.5 hover:underline"
                      >
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {clinic.media?.url ? (
                            <Image
                              src={clinic.media.url}
                              alt={`Logo ${clinic.name}`}
                              fill
                              sizes="32px"
                              className="object-contain p-0.5"
                              unoptimized
                            />
                          ) : (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {clinic.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{formatCnpj(clinic.cnpj)}</TableCell>
                    <TableCell>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(clinic.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(clinic)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => window.open(`/clinics/${clinic.id}`, "_blank")}
                          >
                            <LogIn className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {clinic.status !== "inactive" && (
                            <>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeactivateTarget(clinic)}
                              >
                                <PowerOff className="mr-2 h-4 w-4" />
                                Desativar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(clinic)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({total} clínicas)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog criação/edição */}
      <ClinicDialog open={dialogOpen} onOpenChange={setDialogOpen} clinic={editClinic} />

      {/* Confirm desativar */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              A clínica <strong>{deactivateTarget?.name}</strong> será marcada como inativa. Os
              dados não serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm excluir */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              A clínica <strong>{deleteTarget?.name}</strong> será excluída logicamente e não
              aparecerá mais no sistema. Esta ação não pode ser desfeita pela interface.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
