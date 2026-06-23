"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Users,
  UserCheck,
  CalendarClock,
  Bell,
  CreditCard,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useClinic, useClinicSubscription } from "@/features/clinics/hooks";
import { usePatients } from "@/features/patients/hooks";
import { useUsers } from "@/features/users/hooks";
import { useShifts } from "@/features/shifts/hooks";
import { useSosAlerts } from "@/features/sos/hooks";
import { formatCnpj, formatDate, formatDateTime, formatCurrency } from "@/lib/format";
import { InviteDialog } from "@/features/users/components/invite-dialog";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ativa",
  inactive: "Inativa",
  suspended: "Suspensa",
};

const SHIFT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const SHIFT_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  in_progress: "default",
  completed: "secondary",
  cancelled: "destructive",
};

const SOS_STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  acknowledged: "Confirmado",
  resolved: "Resolvido",
};

const SOS_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "destructive",
  acknowledged: "default",
  resolved: "secondary",
};

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | undefined;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-0.5">
          {loading ? (
            <>
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-20" />
            </>
          ) : (
            <>
              <p className="text-2xl font-bold">{value ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ClinicDetailViewProps {
  id: string;
}

export function ClinicDetailView({ id }: ClinicDetailViewProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: clinic, isLoading: loadingClinic } = useClinic(id);
  const { data: patientsData, isLoading: loadingPatients } = usePatients({
    clinicId: id,
    pageSize: 5,
  });
  const { data: caregiversData, isLoading: loadingCaregivers } = useUsers({
    role: "caregiver",
    clinicId: id,
    pageSize: 5,
  });
  const { data: shiftsData, isLoading: loadingShifts } = useShifts({
    clinicId: id,
    pageSize: 5,
  });
  const { data: sosData, isLoading: loadingSos } = useSosAlerts({
    clinic_id: id,
    page_size: 5,
  });
  const { data: subscription, isLoading: loadingSubscription } = useClinicSubscription(id);

  if (loadingClinic) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!clinic) return null;

  const totalPatients = patientsData?.total ?? 0;
  const totalCaregivers = caregiversData?.total ?? 0;
  const activeShifts = shiftsData?.shifts?.filter((s) => s.status === "in_progress").length ?? 0;
  const activeSos = sosData?.alerts?.filter((a) => a.status === "active").length ?? 0;
  const totalSos = sosData?.total ?? 0;

  const subscriptionLabel = subscription
    ? `${subscription.plan_name} · ${subscription.status === "active" ? "Ativo" : subscription.status === "trial" ? "Trial" : subscription.status}`
    : "Sem assinatura";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/clinics")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {clinic.media?.url ? (
            <Image
              src={clinic.media.url}
              alt={`Logo ${clinic.name}`}
              fill
              sizes="56px"
              className="object-contain p-1"
              unoptimized
            />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{clinic.name}</h1>
            <Badge variant={STATUS_COLORS[clinic.status] ?? "outline"}>
              {STATUS_LABELS[clinic.status] ?? clinic.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">CNPJ: {formatCnpj(clinic.cnpj)}</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar admin
        </Button>
      </div>

      {/* Subscription Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <div className="flex-1 space-y-0.5">
            <div className="text-sm font-medium">
              {loadingSubscription ? <Skeleton className="h-4 w-48" /> : subscriptionLabel}
            </div>
            {subscription && (
              <p className="text-xs text-muted-foreground">
                Início: {formatDate(subscription.start_date)}
                {subscription.end_date && ` · Válido até: ${formatDate(subscription.end_date)}`}
              </p>
            )}
          </div>
          {subscription && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/subscriptions/${subscription.id}`)}
            >
              Ver assinatura
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Pacientes" value={totalPatients} loading={loadingPatients} />
        <StatCard
          icon={UserCheck}
          label="Cuidadores"
          value={totalCaregivers}
          loading={loadingCaregivers}
        />
        <StatCard
          icon={CalendarClock}
          label="Turnos ativos"
          value={activeShifts}
          loading={loadingShifts}
        />
        <StatCard
          icon={Bell}
          label={`SOS${activeSos > 0 ? ` (${activeSos} ativos)` : ""}`}
          value={totalSos}
          loading={loadingSos}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="patients" className="flex-col space-y-4">
        <TabsList>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="caregivers">Cuidadores</TabsTrigger>
          <TabsTrigger value="shifts">Turnos</TabsTrigger>
          <TabsTrigger value="sos">SOS</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>

        {/* ── Patients Tab ── */}
        <TabsContent value="patients">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Pacientes</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/patients?clinicId=${id}`)}
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPatients ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : patientsData?.patients?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientsData.patients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => router.push(`/patients/${p.id}`)}
                          >
                            {p.name}
                          </span>
                        </TableCell>
                        <TableCell>{p.phone}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(p.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum paciente cadastrado nesta clínica.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Caregivers Tab ── */}
        <TabsContent value="caregivers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Cuidadores</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/users?role=caregiver&clinicId=${id}`)}
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingCaregivers ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : caregiversData?.users?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Ativo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caregiversData.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => router.push(`/users/${u.id}`)}
                          >
                            {u.name}
                          </span>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.phone}</TableCell>
                        <TableCell>
                          <Badge variant={u.is_active ? "default" : "secondary"}>
                            {u.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum cuidador vinculado a esta clínica.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Shifts Tab ── */}
        <TabsContent value="shifts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Turnos</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/shifts?clinicId=${id}`)}
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingShifts ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : shiftsData?.shifts?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Cuidador</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shiftsData.shifts.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => router.push(`/shifts/${s.id}`)}
                          >
                            {s.shift_patients?.[0]?.patient_name ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{s.caregiver_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(s.start)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={SHIFT_STATUS_VARIANTS[s.status] ?? "outline"}>
                            {SHIFT_STATUS_LABELS[s.status] ?? s.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum turno registrado nesta clínica.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SOS Tab ── */}
        <TabsContent value="sos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Alertas SOS</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/sos?clinicId=${id}`)}
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingSos ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : sosData?.alerts?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Disparado por</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sosData.alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.patient_name ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {alert.caregiver_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(alert.triggered_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={SOS_STATUS_VARIANTS[alert.status] ?? "outline"}>
                            {SOS_STATUS_LABELS[alert.status] ?? alert.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">Nenhum alerta SOS registrado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Info Tab ── */}
        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações da Clínica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  {clinic.address ? (
                    <div className="space-y-0.5">
                      <p>
                        {clinic.address.street}, {clinic.address.number}
                        {clinic.address.complement ? ` — ${clinic.address.complement}` : ""}
                      </p>
                      <p className="text-muted-foreground">
                        {clinic.address.neighborhood} · {clinic.address.city}/{clinic.address.state}
                      </p>
                      <p className="text-muted-foreground">CEP {clinic.address.zip_code}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Endereço não cadastrado</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{clinic.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>CNPJ: {formatCnpj(clinic.cnpj)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Criada em {formatDate(clinic.created_at)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assinatura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingSubscription ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : subscription ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Plano</span>
                      <span className="font-medium">{subscription.plan_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="font-medium">{formatCurrency(subscription.plan_price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={
                          subscription.status === "active"
                            ? "default"
                            : subscription.status === "trial"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {subscription.status === "active"
                          ? "Ativo"
                          : subscription.status === "trial"
                            ? "Trial"
                            : subscription.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Início</span>
                      <span>{formatDate(subscription.start_date)}</span>
                    </div>
                    {subscription.end_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Válido até</span>
                        <span>{formatDate(subscription.end_date)}</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => router.push(`/subscriptions/${subscription.id}`)}
                    >
                      Gerenciar assinatura
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma assinatura ativa.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} defaultRole="clinic_admin" />
    </div>
  );
}
