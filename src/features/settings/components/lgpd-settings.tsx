"use client";

import { useState } from "react";
import {
  Download,
  UserX,
  Clock,
  Lock,
  CheckCircle2,
  XCircle,
  Search,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import {
  useUpdateRetentionPolicy,
  useExportUserData,
  useExportPatientData,
  useAnonymizeUser,
  useAnonymizePatient,
} from "@/features/settings/hooks";
import { searchUsersForLgpdFetch } from "@/features/settings/services";
import type { LgpdConfig, RetentionPolicy } from "@/features/settings/types";

function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface LgpdSettingsProps {
  config: LgpdConfig;
}

export function LgpdSettings({ config }: LgpdSettingsProps) {
  return (
    <div className="space-y-6">
      <EncryptionStatusSection
        statuses={config.encryption_statuses}
        keyConfigured={config.encryption_key_configured}
      />
      <Separator />
      <RetentionPoliciesSection policies={config.retention_policies} />
      <Separator />
      <ExportSection />
      <Separator />
      <AnonymizeSection />
    </div>
  );
}

// Encryption Status

function EncryptionStatusSection({
  statuses,
  keyConfigured,
}: {
  statuses: LgpdConfig["encryption_statuses"];
  keyConfigured: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Lock className="h-5 w-5 text-primary" />
          Criptografia de Dados
        </h2>
        <p className="text-sm text-muted-foreground">
          Status da criptografia AES-256-GCM nos campos sensíveis.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Chave de criptografia (ENCRYPTION_KEY)</span>
            </div>
            {keyConfigured ? (
              <Badge variant="default" className="gap-1 bg-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Configurada
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Não configurada
              </Badge>
            )}
          </div>

          {!keyConfigured && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Adicione{" "}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
                  ENCRYPTION_KEY=&lt;string segura&gt;
                </code>{" "}
                no arquivo{" "}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code> para
                habilitar a criptografia.
              </span>
            </div>
          )}

          {statuses.length > 0 && (
            <>
              <Separator />
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Campos monitorados
              </p>
              {statuses.map((s) => (
                <div
                  key={`${s.table}.${s.field}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">{s.label}</span>
                    <span className="ml-2 text-muted-foreground">
                      ({s.table}.{s.field})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!s.sample_checked && (
                      <span className="text-xs text-muted-foreground">sem dados</span>
                    )}
                    {s.sample_checked &&
                      (s.encrypted ? (
                        <Badge variant="default" className="gap-1 bg-green-600 text-xs">
                          <Lock className="h-3 w-3" />
                          Cifrado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Info className="h-3 w-3" />
                          Texto plano
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Retention Policies

const POLICY_LABELS: Record<string, { label: string; description: string }> = {
  audit_logs: {
    label: "Logs de Auditoria",
    description: "Registros de ações de administradores",
  },
  sos_alerts: {
    label: "Alertas SOS",
    description: "Alertas de emergência e localizações",
  },
  shifts: {
    label: "Histórico de Turnos",
    description: "Registros de turnos dos cuidadores",
  },
  patients: {
    label: "Dados de Pacientes",
    description: "Prontuários e dados dos pacientes",
  },
};

function RetentionPoliciesSection({ policies }: { policies: RetentionPolicy[] }) {
  const updatePolicy = useUpdateRetentionPolicy();
  const [editing, setEditing] = useState<Record<string, string>>({});

  const handleSave = (policy: RetentionPolicy) => {
    const days = parseInt(editing[policy.id] ?? "");
    if (isNaN(days) || days < 1) {
      toast.error("Período inválido");
      return;
    }
    updatePolicy.mutate(
      { policyId: policy.id, retentionDays: days },
      {
        onSuccess: () => {
          toast.success("Política de retenção atualizada");
          setEditing((prev) => {
            const next = { ...prev };
            delete next[policy.id];
            return next;
          });
        },
        onError: () => {
          toast.error("Erro ao atualizar");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-primary" />
          Política de Retenção de Dados
        </h2>
        <p className="text-sm text-muted-foreground">
          Por quanto tempo cada tipo de dado é mantido (LGPD Art. 15 e 16).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {policies.map((policy) => {
          const meta = POLICY_LABELS[policy.model_name] ?? {
            label: policy.model_name,
            description: "",
          };
          return (
            <Card key={policy.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{meta.label}</CardTitle>
                <CardDescription className="text-xs">{meta.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    className="w-24"
                    value={editing[policy.id] ?? policy.retention_days}
                    onChange={(e) =>
                      setEditing((prev) => ({
                        ...prev,
                        [policy.id]: e.target.value,
                      }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">dias</span>
                  {editing[policy.id] !== undefined && (
                    <Button
                      size="sm"
                      disabled={updatePolicy.isPending}
                      onClick={() => handleSave(policy)}
                    >
                      Salvar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Export Section

interface SearchUserResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SearchPatientResult {
  id: string;
  name: string;
  clinic_name: string;
}

function ExportSection() {
  const [userQuery, setUserQuery] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [userResults, setUserResults] = useState<SearchUserResult[]>([]);
  const [patientResults, setPatientResults] = useState<SearchPatientResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);

  const exportUser = useExportUserData();
  const exportPatient = useExportPatientData();

  const searchUsers = async () => {
    if (!userQuery.trim()) return;
    setSearchingUsers(true);
    try {
      const results = await searchUsersForLgpdFetch(userQuery);
      setUserResults(results);
    } catch {
      toast.error("Erro ao buscar usuários");
    } finally {
      setSearchingUsers(false);
    }
  };

  const searchPatients = async () => {
    if (!patientQuery.trim()) return;
    setSearchingPatients(true);
    try {
      // Use search with clinic param
      const params = new URLSearchParams();
      params.set("search", patientQuery);
      params.set("page_size", "20");
      const { fetchPatients } = await import("@/features/patients/services");
      const result = await fetchPatients({ search: patientQuery, pageSize: 20 });
      setPatientResults(
        result.patients.map((p) => ({
          id: p.id,
          name: p.name,
          clinic_name: p.clinic_name ?? "",
        }))
      );
    } catch {
      toast.error("Erro ao buscar pacientes");
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleExportUser = (id: string, name: string) => {
    exportUser.mutate(id, {
      onSuccess: (result) => {
        if (result.success && result.data) {
          downloadJson(result.data, `lgpd-usuario-${id}.json`);
          toast.success(`Dados de ${name} exportados com sucesso`);
        } else {
          toast.error(result.error ?? "Erro ao exportar dados");
        }
      },
    });
  };

  const handleExportPatient = (id: string, name: string) => {
    exportPatient.mutate(id, {
      onSuccess: (result) => {
        if (result.success && result.data) {
          downloadJson(result.data, `lgpd-paciente-${id}.json`);
          toast.success(`Dados de ${name} exportados com sucesso`);
        } else {
          toast.error(result.error ?? "Erro ao exportar dados");
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Download className="h-5 w-5 text-primary" />
          Exportação de Dados (Portabilidade)
        </h2>
        <p className="text-sm text-muted-foreground">
          Exporte todos os dados de um titular em formato JSON (LGPD Art. 18, V).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dados de Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome ou email..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              />
              <Button variant="outline" size="icon" onClick={searchUsers} disabled={searchingUsers}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {userResults.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exportUser.isPending}
                  onClick={() => handleExportUser(u.id, u.name)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Exportar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dados de Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do paciente..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPatients()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={searchPatients}
                disabled={searchingPatients}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {patientResults.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.clinic_name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exportPatient.isPending}
                  onClick={() => handleExportPatient(p.id, p.name)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Exportar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Anonymize Section

function AnonymizeSection() {
  const [userQuery, setUserQuery] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [userResults, setUserResults] = useState<SearchUserResult[]>([]);
  const [patientResults, setPatientResults] = useState<SearchPatientResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [confirmUser, setConfirmUser] = useState<{ id: string; name: string } | null>(null);
  const [confirmPatient, setConfirmPatient] = useState<{ id: string; name: string } | null>(null);

  const anonymizeUser = useAnonymizeUser();
  const anonymizePatient = useAnonymizePatient();

  const searchUsers = async () => {
    if (!userQuery.trim()) return;
    setSearchingUsers(true);
    try {
      const results = await searchUsersForLgpdFetch(userQuery);
      setUserResults(results);
    } catch {
      toast.error("Erro ao buscar usuários");
    } finally {
      setSearchingUsers(false);
    }
  };

  const searchPatients = async () => {
    if (!patientQuery.trim()) return;
    setSearchingPatients(true);
    try {
      const { fetchPatients } = await import("@/features/patients/services");
      const result = await fetchPatients({ search: patientQuery, pageSize: 20 });
      setPatientResults(
        result.patients.map((p) => ({
          id: p.id,
          name: p.name,
          clinic_name: p.clinic_name ?? "",
        }))
      );
    } catch {
      toast.error("Erro ao buscar pacientes");
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleAnonymizeUser = () => {
    if (!confirmUser) return;
    const { id, name } = confirmUser;
    setConfirmUser(null);
    anonymizeUser.mutate(id, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(`Dados de ${name} anonimizados`);
          setUserResults((prev) => prev.filter((u) => u.id !== id));
        } else {
          toast.error(result.error ?? "Erro ao anonimizar");
        }
      },
    });
  };

  const handleAnonymizePatient = () => {
    if (!confirmPatient) return;
    const { id, name } = confirmPatient;
    setConfirmPatient(null);
    anonymizePatient.mutate(id, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success(`Dados de ${name} anonimizados`);
          setPatientResults((prev) => prev.filter((p) => p.id !== id));
        } else {
          toast.error(result.error ?? "Erro ao anonimizar");
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <UserX className="h-5 w-5 text-primary" />
          Anonimização (Direito ao Esquecimento)
        </h2>
        <p className="text-sm text-muted-foreground">
          Substitui dados pessoais por valores anônimos, mantendo registros operacionais.
          Irreversível. (LGPD Art. 18, VI)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Anonimizar Usuário</CardTitle>
            <CardDescription className="text-xs">
              Remove nome, email e bloqueia o acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome ou email..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              />
              <Button variant="outline" size="icon" onClick={searchUsers} disabled={searchingUsers}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {userResults.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={anonymizeUser.isPending}
                  onClick={() => setConfirmUser({ id: u.id, name: u.name })}
                >
                  <UserX className="mr-1 h-3 w-3" />
                  Anonimizar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Anonimizar Paciente</CardTitle>
            <CardDescription className="text-xs">
              Remove dados pessoais e identificadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do paciente..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPatients()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={searchPatients}
                disabled={searchingPatients}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {patientResults.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.clinic_name}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={anonymizePatient.isPending}
                  onClick={() => setConfirmPatient({ id: p.id, name: p.name })}
                >
                  <UserX className="mr-1 h-3 w-3" />
                  Anonimizar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anonimizar usuário?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a anonimizar os dados de <strong>{confirmUser?.name}</strong>.
              </p>
              <p className="font-medium text-destructive">Esta ação é irreversível.</p>
              <p className="text-sm">
                Nome, email e dados pessoais serão substituídos por valores anônimos. O usuário
                perderá acesso ao sistema.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAnonymizeUser}
              disabled={anonymizeUser.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {anonymizeUser.isPending ? "Anonimizando..." : "Sim, anonimizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmPatient}
        onOpenChange={(open) => !open && setConfirmPatient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anonimizar paciente?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a anonimizar os dados de <strong>{confirmPatient?.name}</strong>.
              </p>
              <p className="font-medium text-destructive">Esta ação é irreversível.</p>
              <p className="text-sm">
                Nome, CPF e dados de saúde serão substituídos por valores anônimos. O registro
                permanece para fins estatísticos.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAnonymizePatient}
              disabled={anonymizePatient.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {anonymizePatient.isPending ? "Anonimizando..." : "Sim, anonimizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
