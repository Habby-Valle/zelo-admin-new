"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Users, CheckCircle2, XOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PatientAvatar } from "@/features/patients/components/patient-avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { usePatients } from "@/features/patients/hooks";
import { useClinics } from "@/features/clinics/hooks";

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

function calculateAge(birthDate: string): number {
  const today = new Date();
  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function PatientsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const clinicId = searchParams.get("clinic_id") ?? "";
  const isActive = searchParams.get("is_active") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const { data, isLoading } = usePatients({
    search,
    clinicId,
    isActive,
    page,
    pageSize,
  });
  const { data: clinicsData } = useClinics({ status: "active", pageSize: 100 });

  const patients = data?.patients ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const clinics = clinicsData?.results ?? [];

  function updateParams(updates: Record<string, string>) {
    const current = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) current.set(k, v);
      else current.delete(k);
    }
    router.push(`${pathname}?${current.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <p className="mt-1 text-muted-foreground">
          Visão global de todos os pacientes da plataforma.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value, page: "" })}
          className="max-w-xs"
        />
        <Select
          value={clinicId || "all"}
          onValueChange={(v) => updateParams({ clinic_id: v === "all" ? "" : (v ?? ""), page: "" })}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {clinicId
                ? (clinics.find((c) => String(c.id) === clinicId)?.name ?? clinicId)
                : "Todas as clínicas"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as clínicas</SelectItem>
            {clinics.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={isActive || "all"}
          onValueChange={(v) => updateParams({ is_active: v === "all" ? "" : (v ?? ""), page: "" })}
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              {isActive === "" || isActive === "all"
                ? "Todos"
                : isActive === "true"
                  ? "Ativo"
                  : "Inativo"}
            </SelectValue>
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
                <TableHead>Clínica</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>Nenhum paciente encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <PatientAvatar name={patient.name} mediaUrl={patient.media?.url} />
                        <button
                          onClick={() => router.push(`/patients/${patient.id}`)}
                          className="text-left hover:underline"
                        >
                          {patient.name}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.clinic_id ? (
                        (clinics.find((c) => String(c.id) === patient.clinic_id)?.name ??
                        `#${patient.clinic_id}`)
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {calculateAge(patient.birth_date)} anos
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {GENDER_LABELS[patient.gender] ?? patient.gender}
                    </TableCell>
                    <TableCell>
                      {patient.is_active ? (
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total}{" "}
            pacientes
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
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
