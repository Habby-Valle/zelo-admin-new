"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Building2,
  User,
  CheckCircle2,
  XOctagon,
  UserCheck,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { usePatient } from "@/features/patients/hooks";

const GENDER_LABELS: Record<string, string> = { M: "Masculino", F: "Feminino", O: "Outro" };

function calculateAge(birthDate: string): number {
  const today = new Date();
  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PatientDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: patient, isLoading, isError } = usePatient(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
        <Button onClick={() => router.push("/patients")}>Voltar</Button>
      </div>
    );
  }

  const age = calculateAge(patient.birth_date);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/patients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarImage src={patient.media?.url ?? undefined} alt={patient.name} />
            <AvatarFallback className="text-base">{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
              {patient.is_active ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <XOctagon className="h-3 w-3" /> Inativo
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {age} anos · {GENDER_LABELS[patient.gender] ?? patient.gender}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" /> Nascimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDate(patient.birth_date)}</p>
            <p className="text-sm text-muted-foreground">{age} anos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" /> Clínica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {patient.clinic_name ?? <span className="text-muted-foreground">—</span>}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-16 font-medium text-muted-foreground">Telefone</span>
            <span>{patient.phone || "—"}</span>
          </div>
          {patient.cpf && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="w-16 font-medium text-muted-foreground">CPF</span>
              <span>{patient.cpf}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCheck className="h-4 w-4" /> Cuidadores ({patient.caregiver_assignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.caregiver_assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cuidador vinculado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Desde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.caregiver_assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.caregiver_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.caregiver_specialization ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.is_active ? "secondary" : "outline"}>
                        {a.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.assigned_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" /> Contatos de Emergência ({patient.emergency_contacts.length}
            )
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.emergency_contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.emergency_contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.profile_family_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.profile_family_phone}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">#{c.priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-6 text-xs text-muted-foreground">
        <span>Criado por {patient.created_by_name}</span>
        <span>Atualizado em {new Date(patient.updated_at).toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
  );
}
