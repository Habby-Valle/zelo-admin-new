"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Pencil,
  Plus,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  useShift,
  useDeleteShift,
  useUpdateShiftStatus,
  useAddShiftPatient,
  useRemoveShiftPatient,
} from "@/features/shifts/hooks";
import { usePatients } from "@/features/patients/hooks";
import type { ShiftStatus } from "@/features/shifts/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_LABELS: Record<ShiftStatus, string> = {
  scheduled: "Agendado",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_VARIANTS: Record<ShiftStatus, "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "outline",
  in_progress: "default",
  completed: "secondary",
  cancelled: "destructive",
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(start: string, end: string): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

interface ShiftDetailClientProps {
  id: number;
}

export function ShiftDetailClient({ id }: ShiftDetailClientProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [removePatientId, setRemovePatientId] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ShiftStatus | "">("");

  const { data: shift, isLoading } = useShift(id);
  const { data: patientsData } = usePatients({ pageSize: 200 });
  const deleteShift = useDeleteShift();
  const updateStatus = useUpdateShiftStatus(id);
  const addPatient = useAddShiftPatient(id);
  const removePatient = useRemoveShiftPatient(id);

  const allPatients = patientsData?.patients ?? [];

  const assignedPatientIds = new Set(shift?.shift_patients.map((sp) => sp.patient_id) ?? []);
  const availablePatients = allPatients.filter((p) => !assignedPatientIds.has(p.id));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!shift) {
    return <div className="py-10 text-center text-muted-foreground">Turno não encontrado.</div>;
  }

  const handleDelete = async () => {
    try {
      await deleteShift.mutateAsync(id);
      toast.success("Turno excluído.");
      router.push("/shifts");
    } catch {
      toast.error("Erro ao excluir turno.");
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    try {
      await updateStatus.mutateAsync(newStatus);
      toast.success("Status atualizado.");
      setStatusDialogOpen(false);
      setNewStatus("");
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleAddPatient = async () => {
    if (!selectedPatientId) return;
    try {
      await addPatient.mutateAsync(Number(selectedPatientId));
      toast.success("Paciente adicionado ao turno.");
      setAddPatientOpen(false);
      setSelectedPatientId("");
    } catch {
      toast.error("Erro ao adicionar paciente.");
    }
  };

  const handleRemovePatient = async () => {
    if (!removePatientId) return;
    try {
      await removePatient.mutateAsync(removePatientId);
      toast.success("Paciente removido do turno.");
    } catch {
      toast.error("Erro ao remover paciente.");
    } finally {
      setRemovePatientId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/shifts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Turno #{shift.id}</h1>
            <Badge variant={STATUS_VARIANTS[shift.status]}>{STATUS_LABELS[shift.status]}</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Cuidador: {shift.caregiver_name}
            {shift.clinic_name && <> &middot; Clínica: {shift.clinic_name}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStatusDialogOpen(true)}>
            Alterar status
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/shifts/${id}/edit`)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Período</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Início: </span>
              {formatDateTime(shift.start)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Fim: </span>
              {formatDateTime(shift.end)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duração</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-lg font-semibold">{formatDuration(shift.start, shift.end)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vinculação</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            {shift.clinic_name ? (
              <div className="text-sm">{shift.clinic_name}</div>
            ) : (
              <span className="text-sm text-muted-foreground">Sem clínica</span>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              {shift.caregiver_name}
            </div>
          </CardContent>
        </Card>
      </div>

      {shift.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{shift.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Pacientes ({shift.shift_patients.length})
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAddPatientOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {shift.shift_patients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum paciente vinculado a este turno.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shift.shift_patients.map((sp) => (
                    <TableRow key={sp.id}>
                      <TableCell className="font-medium">
                        <Link href={`/patients/${sp.patient_id}`} className="hover:underline">
                          {sp.patient_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setRemovePatientId(sp.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir turno?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!removePatientId}
        onOpenChange={(open) => !open && setRemovePatientId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              O paciente será desvinculado deste turno.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePatient}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addPatientOpen} onOpenChange={setAddPatientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paciente</label>
              <Select
                value={selectedPatientId}
                onValueChange={(v) => setSelectedPatientId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedPatientId
                      ? availablePatients.find((p) => p.id === selectedPatientId)?.name ??
                        selectedPatientId
                      : "Selecione o paciente"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availablePatients.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      Todos os pacientes já foram adicionados
                    </SelectItem>
                  ) : (
                    availablePatients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPatientOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddPatient}
              disabled={!selectedPatientId || addPatient.isPending}
            >
              {addPatient.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Novo status</label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ShiftStatus)}>
                <SelectTrigger>
                  <SelectValue>
                    {newStatus ? STATUS_LABELS[newStatus] ?? newStatus : "Selecione o status"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange} disabled={!newStatus || updateStatus.isPending}>
              {updateStatus.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
