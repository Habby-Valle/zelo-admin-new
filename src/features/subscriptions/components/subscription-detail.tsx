"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Building2,
  Mail,
  Clock,
  Zap,
  History,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatCurrency } from "@/lib/format";
import { fetchSubscriptionDetails } from "@/features/subscriptions/services";
import type { SubscriptionDetails } from "@/features/subscriptions/types";

interface HistoryEvent {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface PlanOption {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number | null;
}

function formatBillingCycle(cycle: string) {
  const map: Record<string, string> = {
    monthly: "Mensal",
    quarterly: "Trimestral",
    annual: "Anual",
  };
  return map[cycle] ?? cycle;
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

function formatDateOrDash(dateStr: string | null) {
  if (!dateStr) return "-";
  return formatDate(dateStr);
}

interface SubscriptionDetailViewProps {
  id: string;
}

export function SubscriptionDetailView({ id }: SubscriptionDetailViewProps) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [clinicName, setClinicName] = useState<string>("");
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [activating, setActivating] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState("monthly");
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showDatesDialog, setShowDatesDialog] = useState(false);
  const [extendDays, setExtendDays] = useState("14");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [newPlanId, setNewPlanId] = useState("");
  const [newBillingCycle, setNewBillingCycle] = useState("monthly");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchSubscriptionDetails(id);
        setSubscription(data);
        setClinicName(data.clinicName);
      } catch {
        setSubscription(null);
        try {
          const clinicRes = await fetch(`/api/proxy/clinics/${id}/`);
          if (clinicRes.ok) {
            const clinicData = await clinicRes.json();
            setClinicName(clinicData.name || `Clínica #${id}`);
          } else {
            setClinicName(`Clínica #${id}`);
          }
        } catch {
          setClinicName(`Clínica #${id}`);
        }
      }
      setLoading(false);
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (showHistory && subscription?.id) {
      fetch(
        `/api/proxy/audit-logs/?content_type=clinicplan&object_id=${subscription.id}&page_size=20`
      )
        .then((res) => res.json())
        .then((data) => {
          const results = (data.results ?? []).map((log: Record<string, unknown>) => ({
            id: String(log.id),
            action: String(log.action ?? ""),
            metadata: (log.changes as Record<string, unknown>) ?? {},
            created_at: String(log.created_at ?? ""),
          }));
          setHistory(results);
        })
        .catch(() => setHistory([]));
    }
  }, [showHistory, subscription?.id]);

  useEffect(() => {
    if (showActivateDialog || showChangePlanDialog) {
      fetch("/api/proxy/plans/?is_active=true&page_size=100")
        .then((res) => res.json())
        .then((data) => {
          setAvailablePlans(data.results || []);
        });
    }
  }, [showActivateDialog, showChangePlanDialog]);

  async function handleActivate() {
    if (!selectedPlanId) return;

    setActivating(true);
    try {
      const response = await fetch("/api/proxy/subscriptions/activate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: id,
          planId: selectedPlanId,
          billingCycle: selectedBillingCycle,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowActivateDialog(false);
        router.refresh();
      }
    } finally {
      setActivating(false);
    }
  }

  async function handleExtend() {
    if (!subscription) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/proxy/subscriptions/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extend",
          days: parseInt(extendDays) || 14,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowExtendDialog(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateDates() {
    if (!subscription || !newStartsAt || !newExpiresAt) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/proxy/subscriptions/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_dates",
          starts_at: newStartsAt,
          expires_at: newExpiresAt,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowDatesDialog(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePlan() {
    if (!subscription || !newPlanId) return;

    setChangingPlan(true);
    try {
      const response = await fetch("/api/proxy/subscriptions/change-plan/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: subscription.clinicId,
          newPlanId,
          billingCycle: newBillingCycle,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowChangePlanDialog(false);
        setNewPlanId("");
        router.refresh();
      }
    } finally {
      setChangingPlan(false);
    }
  }

  const canExtend = subscription?.status === "trial";
  const canUpdateDates =
    subscription?.status === "trial" ||
    subscription?.status === "active" ||
    subscription?.status === "free";

  const canActivate = subscription?.status === "expired" || subscription?.status === "cancelled";

  const canAssign = true;

  const daysRemaining =
    subscription && (subscription.status === "active" || subscription.status === "trial")
      ? Math.ceil(
          (new Date(subscription.expiresAt).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded bg-muted" />
          <div className="h-48 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/subscriptions")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Detalhes da Assinatura</h1>
              <p className="text-muted-foreground">
                {clinicName || `Clínica #${id}`} — Sem assinatura ativa
              </p>
            </div>
          </div>
          {canAssign && (
            <Button onClick={() => setShowActivateDialog(true)}>
              <Zap className="mr-2 h-4 w-4" />
              Atribuir Plano
            </Button>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Clínica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta clínica ainda não possui nenhum plano atribuído. Use o botão acima para atribuir
              um plano gratuitamente.
            </p>
          </CardContent>
        </Card>

        <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Plano</DialogTitle>
              <DialogDescription>
                Atribuir plano manualmente para {clinicName || `Clínica #${id}`}. Isso não requer
                pagamento.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={selectedPlanId} onValueChange={(v) => setSelectedPlanId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue>
                      {selectedPlanId
                        ? (availablePlans.find((p) => p.id === selectedPlanId)?.name ??
                          selectedPlanId)
                        : "Selecione um plano"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {formatCurrency(plan.monthly_price)}/mês
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
                    <SelectValue>{formatBillingCycle(selectedBillingCycle)}</SelectValue>
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
              <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/subscriptions")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Detalhes da Assinatura</h1>
            <p className="text-muted-foreground">
              Assinatura da clínica {subscription?.clinicName}
            </p>
          </div>
        </div>
        {canExtend && (
          <Button variant="outline" onClick={() => setShowExtendDialog(true)}>
            <Clock className="mr-2 h-4 w-4" />
            Estender Trial
          </Button>
        )}
        {canUpdateDates && (
          <Button
            variant="outline"
            onClick={() => {
              setNewStartsAt(subscription?.startedAt?.slice(0, 10) || "");
              setNewExpiresAt(subscription?.expiresAt?.slice(0, 10) || "");
              setShowDatesDialog(true);
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Alterar Datas
          </Button>
        )}
        {canActivate && (
          <Button onClick={() => setShowActivateDialog(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Ativar Assinatura
          </Button>
        )}
        {canAssign && !canActivate && (
          <Button onClick={() => setShowActivateDialog(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Atribuir Plano
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowHistory(true)}>
          <History className="mr-2 h-4 w-4" />
          Histórico
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Clínica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{subscription.clinicName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4" />
                {subscription.clinicEmail || "Não informado"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{subscription.planName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(subscription.planPrice)} /{" "}
                  {formatBillingCycle(subscription.planBillingCycle)}
                </p>
              </div>
              <StatusBadge status={subscription.status} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Máx. Usuários</p>
                <p className="font-medium">{subscription.maxUsers}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Máx. Pacientes</p>
                <p className="font-medium">{subscription.maxPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vigência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Início</p>
                <p className="font-medium">{formatDateOrDash(subscription.startedAt)}</p>
              </div>
              {subscription.status !== "free" && (
                <div>
                  <p className="text-sm text-muted-foreground">Expira em</p>
                  <p className="font-medium">{formatDateOrDash(subscription.expiresAt)}</p>
                </div>
              )}
            </div>
            {subscription.trialEndsAt && (
              <div>
                <p className="text-sm text-muted-foreground">Trial termina em</p>
                <p className="font-medium">{formatDateOrDash(subscription.trialEndsAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dias restantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {daysRemaining !== null ? (
              <div>
                <p
                  className={`text-3xl font-bold ${
                    daysRemaining <= 7
                      ? "text-red-600"
                      : daysRemaining <= 30
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                >
                  {daysRemaining} dias
                </p>
                <p className="text-sm text-muted-foreground">
                  {daysRemaining <= 0 ? "Expirado" : "restantes"}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {subscription.status === "free"
                  ? "Plano gratuito sem vencimento"
                  : subscription.status === "cancelled"
                    ? "Assinatura cancelada"
                    : "Assinatura expirada"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stripe */}
      {subscription.stripeSubscriptionId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Subscription ID</p>
                <a
                  href={`https://dashboard.stripe.com/test/subscriptions/${subscription.stripeSubscriptionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs hover:text-primary"
                >
                  {subscription.stripeSubscriptionId}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <p className="text-muted-foreground">Status Stripe</p>
                <p className="font-medium capitalize">{subscription.stripeStatus ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Início do período</p>
                <p className="font-medium">{formatDateOrDash(subscription.currentPeriodStart)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fim do período</p>
                <p className="font-medium">{formatDateOrDash(subscription.currentPeriodEnd)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features do Plano */}
      {subscription.features && subscription.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recursos do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subscription.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dialog para ativar / atribuir assinatura */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{canActivate ? "Ativar Assinatura" : "Atribuir Plano"}</DialogTitle>
            <DialogDescription>
              {canActivate
                ? `Ativar assinatura manualmente para ${subscription?.clinicName}. Isso não requer pagamento.`
                : `Atribuir plano manualmente para ${subscription?.clinicName}. Isso não requer pagamento.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={selectedPlanId} onValueChange={(v) => setSelectedPlanId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue>
                    {selectedPlanId
                      ? (availablePlans.find((p) => p.id === selectedPlanId)?.name ??
                        selectedPlanId)
                      : "Selecione um plano"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatCurrency(plan.monthly_price)}/mês
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
                  <SelectValue>{formatBillingCycle(selectedBillingCycle)}</SelectValue>
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
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleActivate} disabled={!selectedPlanId || activating}>
              {activating ? "Ativando..." : canActivate ? "Ativar" : "Atribuir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para estender trial */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estender Trial</DialogTitle>
            <DialogDescription>Adicionar dias ao período de Trial da clínica.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dias para adicionar</Label>
              <Input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                placeholder="14"
              />
              <p className="text-xs text-muted-foreground">Dias atuais: {daysRemaining ?? "N/A"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExtend} disabled={saving}>
              {saving ? "Salvando..." : "Estender"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para alterar datas */}
      <Dialog open={showDatesDialog} onOpenChange={setShowDatesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Datas</DialogTitle>
            <DialogDescription>Alterar data de início e expiração da assinatura.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={newStartsAt}
                onChange={(e) => setNewStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Expiração</Label>
              <Input
                type="date"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDatesDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateDates} disabled={saving || !newStartsAt || !newExpiresAt}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para mudar de plano */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudar de Plano</DialogTitle>
            <DialogDescription>
              Alterar o plano da clínica. O cálculo pró-rata será aplicado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Novo Plano</Label>
              <Select value={newPlanId} onValueChange={(v) => setNewPlanId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue>
                    {newPlanId
                      ? (availablePlans.find((p) => p.id === newPlanId)?.name ?? newPlanId)
                      : "Selecione um plano"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availablePlans
                    .filter((p) => p.id !== subscription?.planId)
                    .map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {formatCurrency(plan.monthly_price)}/mês
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ciclo de Cobrança</Label>
              <Select
                value={newBillingCycle}
                onValueChange={(v) => setNewBillingCycle(v ?? "monthly")}
              >
                <SelectTrigger>
                  <SelectValue>{formatBillingCycle(newBillingCycle)}</SelectValue>
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
            <Button variant="outline" onClick={() => setShowChangePlanDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan} disabled={!newPlanId || changingPlan}>
              {changingPlan ? "Alterando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Histórico */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico de Alterações</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                Nenhuma alteração registrada.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((event) => (
                  <div key={event.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {event.action.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    {event.metadata && (
                      <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistory(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
