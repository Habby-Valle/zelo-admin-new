"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  UserCircle2,
  CheckCircle2,
  XOctagon,
  CalendarDays,
  CreditCard,
  Zap,
  Shield,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUser } from "@/features/users/hooks";
import { apiFetchClient } from "@/lib/api-client";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  clinic_admin: "Admin de Clínica",
  guardian: "Responsável",
  caregiver: "Cuidador",
  family: "Familiar",
};

interface UserDetailClientProps {
  id: string;
}

interface PlanOption {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number | null;
}

interface DjangoGuardianSubscription {
  id: number;
  guardian_id: number;
  guardian_name: string;
  guardian_email: string | null;
  plan_name: string;
  plan_price: string;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  payment_failed_at: string | null;
  stripe_status: string | null;
  current_period_end: string | null;
  created_at: string;
}

interface GuardianSubscription {
  id: string;
  guardianId: string;
  guardianName: string;
  planName: string;
  planPrice: number;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  stripeStatus: string | null;
  currentPeriodEnd: string | null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    trial: "secondary",
    free: "outline",
    expired: "destructive",
    cancelled: "outline",
  };

  const labels: Record<string, string> = {
    active: "Ativo",
    trial: "Trial",
    free: "Gratuito",
    expired: "Expirado",
    cancelled: "Cancelado",
  };

  return <Badge variant={variants[status] ?? "outline"}>{labels[status] ?? status}</Badge>;
}

export default function UserDetailClient({ id }: UserDetailClientProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser(id);
  const [subscription, setSubscription] = useState<GuardianSubscription | null | undefined>(
    undefined
  );
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState("monthly");
  const [activating, setActivating] = useState(false);

  function mapSubscription(data: DjangoGuardianSubscription): GuardianSubscription {
    return {
      id: String(data.id),
      guardianId: String(data.guardian_id),
      guardianName: data.guardian_name ?? "Guardião sem nome",
      planName: data.plan_name ?? "Plano não encontrado",
      planPrice: parseFloat(data.plan_price ?? "0"),
      status: data.status,
      startedAt: data.start_date,
      expiresAt: data.end_date ?? null,
      trialEndsAt: data.trial_ends_at ?? null,
      createdAt: data.created_at,
      stripeStatus: data.stripe_status ?? null,
      currentPeriodEnd: data.current_period_end ?? null,
    };
  }

  useEffect(() => {
    if (!user || user.role !== "guardian") return;

    apiFetchClient<DjangoGuardianSubscription>(`/management/guardian-subscriptions/${id}/`)
      .then((data) => setSubscription(mapSubscription(data)))
      .catch(() => setSubscription(null));
  }, [user, id]);

  useEffect(() => {
    if (showPlanDialog) {
      apiFetchClient<{ results: PlanOption[] }>("/plans/?scope=guardian&page_size=100")
        .then((data) => {
          setAvailablePlans(data.results || []);
        })
        .catch(() => {});
    }
  }, [showPlanDialog]);

  async function handleActivate() {
    if (!selectedPlanId) return;

    setActivating(true);
    try {
      await apiFetchClient(`/management/guardian-subscriptions/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "activate",
          plan_id: selectedPlanId,
          billing_cycle: selectedBillingCycle,
        }),
      });

      setShowPlanDialog(false);
      apiFetchClient<DjangoGuardianSubscription>(`/management/guardian-subscriptions/${id}/`)
        .then((data) => setSubscription(mapSubscription(data)))
        .catch(() => setSubscription(null));
    } catch {
      alert("Erro ao atribuir plano");
    } finally {
      setActivating(false);
    }
  }

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

      {user.role === "guardian" && (
        <>
          {subscription === undefined ? (
            <Skeleton className="h-48 rounded-lg" />
          ) : subscription ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plano
                </CardTitle>
                <Button onClick={() => setShowPlanDialog(true)}>
                  <Zap className="mr-2 h-4 w-4" />
                  Atribuir Plano
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">{subscription.planName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(subscription.planPrice)}/mês
                    </p>
                  </div>
                  <StatusBadge status={subscription.status} />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Início</p>
                    <p className="font-medium">{formatDate(subscription.startedAt)}</p>
                  </div>
                  {subscription.status !== "free" && (
                    <div>
                      <p className="text-muted-foreground">Expira em</p>
                      <p className="font-medium">{formatDate(subscription.expiresAt)}</p>
                    </div>
                  )}
                </div>
                {subscription.trialEndsAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Trial termina em</p>
                    <p className="font-medium">{formatDate(subscription.trialEndsAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plano
                </CardTitle>
                <Button onClick={() => setShowPlanDialog(true)}>
                  <Zap className="mr-2 h-4 w-4" />
                  Atribuir Plano
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Este guardião ainda não possui nenhum plano atribuído.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Plano</DialogTitle>
            <DialogDescription>
              Atribuir plano manualmente para {user?.name}. Isso não requer pagamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={selectedPlanId} onValueChange={(v) => setSelectedPlanId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatPrice(plan.monthly_price)}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ciclo de Cobrança</Label>
              <Select
                value={selectedBillingCycle}
                onValueChange={(v) => setSelectedBillingCycle(v ?? "monthly")}
              >
                <SelectTrigger>
                  <SelectValue>
                    {selectedBillingCycle === "monthly"
                      ? "Mensal"
                      : selectedBillingCycle === "quarterly"
                        ? "Trimestral"
                        : "Anual"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleActivate} disabled={!selectedPlanId || activating}>
              {activating ? "Atribuindo..." : "Atribuir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
