"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RecoveryCodes } from "@/features/auth";
import { useMfaConfirm, useMfaSetup } from "@/features/auth/hooks";
import { useDisableMfa, useMfaStatus, useRegenerateRecoveryCodes } from "@/features/settings/hooks";
import { mfaCodeSchema } from "@/lib/validations/auth";

const credentialsSchema = z.object({
  password: z.string().min(1, "Senha obrigatória"),
  code: z.string().min(1, "Código obrigatório"),
});

type CredentialsValues = z.infer<typeof credentialsSchema>;
type CodeValues = z.infer<typeof mfaCodeSchema>;

export function MfaSettings() {
  const { data: status, isLoading, refetch } = useMfaStatus();
  const setup = useMfaSetup();
  const confirm = useMfaConfirm();
  const disable = useDisableMfa();
  const regenerate = useRegenerateRecoveryCodes();

  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const codeForm = useForm<CodeValues>({ resolver: zodResolver(mfaCodeSchema) });
  const disableForm = useForm<CredentialsValues>({ resolver: zodResolver(credentialsSchema) });
  const regenerateForm = useForm<CredentialsValues>({ resolver: zodResolver(credentialsSchema) });

  function onConfirm(values: CodeValues) {
    confirm.mutate(
      { code: values.code },
      {
        onSuccess: (result) => {
          setRecoveryCodes(result.recovery_codes);
          setup.reset();
          codeForm.reset();
          refetch();
        },
      }
    );
  }

  function onDisable(values: CredentialsValues) {
    setMessage(null);
    disable.mutate(values, {
      onSuccess: () => {
        setMessage("Verificação em duas etapas desativada.");
        disableForm.reset();
      },
    });
  }

  function onRegenerate(values: CredentialsValues) {
    setMessage(null);
    regenerate.mutate(values, {
      onSuccess: (codes) => {
        setRecoveryCodes(codes);
        regenerateForm.reset();
      },
    });
  }

  if (isLoading || !status) {
    return <Skeleton className="h-48 max-w-lg rounded-xl" />;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            {status.enabled ? (
              <ShieldCheck className="h-5 w-5 text-primary" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-destructive" />
            )}
            Verificação em duas etapas
          </CardTitle>
          <Badge variant={status.enabled ? "default" : "destructive"}>
            {status.enabled ? "Ativa" : "Inativa"}
          </Badge>
        </div>
        <CardDescription>
          {status.required
            ? "Obrigatória para o seu perfil: com acesso a todas as clínicas, senha sozinha não basta."
            : "Um código do app autenticador, além da senha, para entrar no painel."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {recoveryCodes && <RecoveryCodes codes={recoveryCodes} />}

        {!status.enabled && !setup.data && (
          <Button onClick={() => setup.mutate()} disabled={setup.isPending}>
            {setup.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando…
              </>
            ) : (
              "Ativar verificação em duas etapas"
            )}
          </Button>
        )}

        {!status.enabled && setup.data && (
          <form onSubmit={codeForm.handleSubmit(onConfirm)} className="space-y-4" noValidate>
            <div
              className="mx-auto flex h-44 w-44 items-center justify-center rounded-lg bg-white p-2 [&_svg]:h-full [&_svg]:w-full"
              // SVG gerado pela própria API a partir do otpauth_uri.
              dangerouslySetInnerHTML={{ __html: setup.data.qr_svg }}
            />
            <p className="text-center text-xs text-muted-foreground">
              Chave manual: <span className="font-mono break-all">{setup.data.secret}</span>
            </p>

            {confirm.error && (
              <Alert variant="destructive">
                <AlertDescription>{confirm.error.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="mfa-code">Código do app</Label>
              <Input
                id="mfa-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="text-center font-mono tracking-[0.4em]"
                {...codeForm.register("code")}
              />
              {codeForm.formState.errors.code && (
                <p className="text-xs text-destructive">{codeForm.formState.errors.code.message}</p>
              )}
            </div>

            <Button type="submit" disabled={confirm.isPending}>
              {confirm.isPending ? "Ativando…" : "Confirmar e ativar"}
            </Button>
          </form>
        )}

        {status.enabled && (
          <form
            onSubmit={regenerateForm.handleSubmit(onRegenerate)}
            className="space-y-3 border-t pt-4"
            noValidate
          >
            <div>
              <p className="text-sm font-medium">Gerar novos códigos de recuperação</p>
              <p className="text-xs text-muted-foreground">
                Os códigos antigos deixam de valer na hora.
              </p>
            </div>

            {regenerate.error && (
              <Alert variant="destructive">
                <AlertDescription>{regenerate.error.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                {...regenerateForm.register("password")}
              />
              <Input
                inputMode="numeric"
                maxLength={6}
                placeholder="Código do app"
                className="font-mono"
                {...regenerateForm.register("code")}
              />
            </div>
            <Button type="submit" variant="outline" disabled={regenerate.isPending}>
              {regenerate.isPending ? "Gerando…" : "Gerar novos códigos"}
            </Button>
          </form>
        )}

        {status.enabled && !status.required && (
          <form
            onSubmit={disableForm.handleSubmit(onDisable)}
            className="space-y-3 border-t pt-4"
            noValidate
          >
            <div>
              <p className="text-sm font-medium">Desativar</p>
              <p className="text-xs text-muted-foreground">
                Pede senha e código — o painel volta a depender só da senha.
              </p>
            </div>

            {disable.error && (
              <Alert variant="destructive">
                <AlertDescription>{disable.error.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                {...disableForm.register("password")}
              />
              <Input
                maxLength={11}
                placeholder="Código do app"
                className="font-mono"
                {...disableForm.register("code")}
              />
            </div>
            <Button type="submit" variant="destructive" disabled={disable.isPending}>
              {disable.isPending ? "Desativando…" : "Desativar"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
