"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  ListChecks,
  Pencil,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useChecklist, useDeleteChecklist } from "@/features/checklists/hooks";
import { ChecklistDialog } from "./checklist-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

const ITEM_TYPE_LABELS: Record<string, string> = {
  boolean: "Sim/Não",
  text: "Texto",
  number: "Número",
  select: "Seleção",
};

interface ChecklistDetailClientProps {
  id: number;
}

export function ChecklistDetailClient({ id }: ChecklistDetailClientProps) {
  const router = useRouter();
  const { data: checklist, isLoading } = useChecklist(id);
  const deleteChecklist = useDeleteChecklist();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    deleteChecklist.mutate(id, {
      onSuccess: () => {
        toast.success("Template excluído.");
        router.push("/checklists");
      },
      onError: () => {
        toast.error("Erro ao excluir template.");
        setDeleteOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex flex-1 items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
        <p>Checklist não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/checklists")}>
          Voltar
        </Button>
      </div>
    );
  }

  const items = checklist.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/checklists")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            {checklist.icon ? (
              <MaterialIcon name={checklist.icon} size="lg" className="text-primary" />
            ) : (
              <ListChecks className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{checklist.name}</h1>
              {checklist.is_active ? (
                <Badge variant="default">Ativo</Badge>
              ) : (
                <Badge variant="secondary">Inativo</Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-4 text-muted-foreground">
              {checklist.clinic_name && (
                <span className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  {checklist.clinic_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clínica</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {checklist.clinic_name ? (
              <Link
                href={`/clinics/${checklist.clinic_id}`}
                className="text-primary hover:underline"
              >
                {checklist.clinic_name}
              </Link>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>{items.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Criado em</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {new Date(checklist.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4" />
            Itens do Template ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item cadastrado neste template.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Obrigatório</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead>Opções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ITEM_TYPE_LABELS[item.type] ?? item.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.required ? (
                          <Badge variant="destructive">Sim</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Não</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.has_observation ? (
                          <Badge variant="secondary">Sim</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Não</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.type === "select" && item.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.options.slice(0, 3).map((opt) => (
                              <Badge key={opt.id} variant="outline" className="text-xs">
                                {opt.label}
                              </Badge>
                            ))}
                            {item.options.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.options.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ChecklistDialog open={editOpen} onOpenChange={setEditOpen} checklist={checklist} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              O template <strong>{checklist.name}</strong> será excluído permanentemente. Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteChecklist.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
