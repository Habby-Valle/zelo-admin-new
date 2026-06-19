"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertTriangle, Globe, Mail, MapPin, Phone, Save, ToggleLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemSettings, useSaveSystemSettings } from "@/features/settings/hooks";
import { ImageUpload } from "@/components/shared/image-upload";

function toISOStringLocal(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString();
}

export function SystemSettingsTab() {
  const { data: settings, isLoading } = useSystemSettings();
  const saveMutation = useSaveSystemSettings();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [message, setMessage] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [plansEnabled, setPlansEnabled] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(true);
  const [appName, setAppName] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [appSiteUrl, setAppSiteUrl] = useState("");
  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [adminLogoUrl, setAdminLogoUrl] = useState("");
  const [logoMediaId, setLogoMediaId] = useState<number | null>(null);
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenance_mode);
      setMessage(settings.maintenance_message);
      setPlannedEnd(
        settings.maintenance_planned_end
          ? new Date(settings.maintenance_planned_end).toISOString().slice(0, 16)
          : ""
      );
      setPlansEnabled(settings.plans_enabled);
      setFeedbackVisible(settings.feedback_visible);
      setAppName(settings.app_name);
      setAppUrl(settings.app_url);
      setAppSiteUrl(settings.app_site_url);
      setAppStoreUrl(settings.app_store_url);
      setPlayStoreUrl(settings.play_store_url);
      setSupportEmail(settings.support_email);
      setSupportPhone(settings.support_phone);
      setSupportWhatsapp(settings.support_whatsapp);
      setAdminLogoUrl(settings.admin_logo_url);
      setCnpj(settings.cnpj);
      setAddress(settings.address);
    }
  }, [settings]);

  const handleSaveFlags = async (newPlansEnabled: boolean, newFeedbackVisible: boolean) => {
    try {
      await saveMutation.mutateAsync({
        ...settings,
        plans_enabled: newPlansEnabled,
        feedback_visible: newFeedbackVisible,
      });
      toast.success("Configuração salva");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        ...settings,
        maintenance_mode: maintenanceMode,
        maintenance_message: message,
        maintenance_planned_end: plannedEnd ? toISOStringLocal(plannedEnd) : null,
        plans_enabled: plansEnabled,
        feedback_visible: feedbackVisible,
        app_name: appName,
        app_url: appUrl,
        app_site_url: appSiteUrl,
        app_store_url: appStoreUrl,
        play_store_url: playStoreUrl,
        support_email: supportEmail,
        support_phone: supportPhone,
        support_whatsapp: supportWhatsapp,
        admin_logo_url: adminLogoUrl,
        admin_logo_media_id: logoMediaId,
        cnpj,
        address,
      });
      toast.success("Configurações salvas com sucesso");
    } catch {
      toast.error("Erro ao salvar configurações");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Modo Manutenção
          </CardTitle>
          <CardDescription>
            Quando ativado, os painéis das clínicas e o app mobile exibirão uma página de
            manutenção. O Super Admin continuará tendo acesso normal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Status</Label>
              <p className="text-sm text-muted-foreground">
                {maintenanceMode ? "Sistema em manutenção" : "Sistema operacional"}
              </p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem de Manutenção</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mensagem exibida durante a manutenção"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedEnd">Previsão de Retorno (opcional)</Label>
            <Input
              id="plannedEnd"
              type="datetime-local"
              value={plannedEnd}
              onChange={(e) => setPlannedEnd(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Data e hora prevista para o sistema voltar a funcionar.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="h-5 w-5" />
            Funcionalidades
          </CardTitle>
          <CardDescription>
            Controle a disponibilidade de funcionalidades para os admins de clínica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Planos pagos habilitados</Label>
              <p className="text-sm text-muted-foreground">
                {plansEnabled
                  ? "Admins podem assinar planos pagos"
                  : "Apenas o plano gratuito está disponível"}
              </p>
            </div>
            <Switch
              checked={plansEnabled}
              disabled={saveMutation.isPending}
              onCheckedChange={(val) => {
                setPlansEnabled(val);
                handleSaveFlags(val, feedbackVisible);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Página de Feedback visível</Label>
              <p className="text-sm text-muted-foreground">
                {feedbackVisible
                  ? "Admins de clínica veem o menu e a página de Feedback"
                  : "A página de Feedback está oculta no painel da clínica"}
              </p>
            </div>
            <Switch
              checked={feedbackVisible}
              disabled={saveMutation.isPending}
              onCheckedChange={(val) => {
                setFeedbackVisible(val);
                handleSaveFlags(plansEnabled, val);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
          <CardDescription>Configure as informações públicas do sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appName">Nome do App</Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Zelo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appUrl">URL do Painel</Label>
              <Input
                id="appUrl"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://app-saude.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appSiteUrl">URL do Site</Label>
              <Input
                id="appSiteUrl"
                value={appSiteUrl}
                onChange={(e) => setAppSiteUrl(e.target.value)}
                placeholder="https://site.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo Admin</Label>
            <ImageUpload currentUrl={adminLogoUrl} onMediaChange={(id) => setLogoMediaId(id)} />
            <div className="mt-2">
              <Input
                id="adminLogoUrl"
                value={adminLogoUrl}
                onChange={(e) => setAdminLogoUrl(e.target.value)}
                placeholder="https://cdn.example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Links dos Apps
            </Label>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={appStoreUrl}
                onChange={(e) => setAppStoreUrl(e.target.value)}
                placeholder="Link App Store (iOS)"
              />
              <Input
                value={playStoreUrl}
                onChange={(e) => setPlayStoreUrl(e.target.value)}
                placeholder="Link Google Play"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contato
          </CardTitle>
          <CardDescription>Informações de contato para suporte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">
                <Mail className="mr-1 inline h-3 w-3" />
                Email de Suporte
              </Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="suporte@appsaude.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportPhone">Telefone</Label>
              <Input
                id="supportPhone"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportWhatsapp">WhatsApp</Label>
              <Input
                id="supportWhatsapp"
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                placeholder="https://wa.me/5511999999999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              <MapPin className="mr-1 inline h-3 w-3" />
              Endereço
            </Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua exemplo, 123 - Cidade - Estado"
              rows={2}
            />
          </div>

          <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
