"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Loader2, KeyRound } from "lucide-react";

import { useMfaConfirm, useMfaSetup } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/authStore";
import { mfaCodeSchema, type MfaCodeSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecoveryCodes } from "./recovery-codes";

/**
 * Enrolment obrigatório do super admin, no meio do login.
 *
 * Quem chega aqui ainda não tem sessão: passou pela senha e a API devolveu só
 * um bilhete. Confirmar o primeiro código é o que abre o painel.
 */
export function MfaSetupForm() {
  const router = useRouter();
  const setup = useMfaSetup();
  const confirm = useMfaConfirm();
  const { setUser } = useAuthStore();
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  const { mutate: startSetup } = setup;
  useEffect(() => {
    startSetup();
  }, [startSetup]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaCodeSchema>({ resolver: zodResolver(mfaCodeSchema) });

  function onSubmit(data: MfaCodeSchema) {
    confirm.mutate(
      { code: data.code },
      {
        onSuccess: (result) => {
          setRecoveryCodes(result.recovery_codes);
          if (result.user) setUser(result.user);
        },
      }
    );
  }

  function goToPanel() {
    router.push("/dashboard");
    router.refresh();
  }

  const serverError = setup.error?.message ?? confirm.error?.message;

  if (recoveryCodes) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Códigos de recuperação</CardTitle>
          <CardDescription className="mt-1">
            Verificação em duas etapas ativada. Salve os códigos abaixo antes de continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RecoveryCodes codes={recoveryCodes} />
          <Button className="w-full" onClick={goToPanel}>
            Salvei meus códigos, continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Zelo
            </p>
            <p className="text-sm leading-none font-semibold">Painel Administrativo</p>
          </div>
        </div>

        <div>
          <CardTitle className="text-2xl">Ative a verificação em duas etapas</CardTitle>
          <CardDescription className="mt-1">
            Seu perfil tem acesso a todas as clínicas, então o segundo fator é obrigatório. Escaneie
            o QR code com o Google Authenticator, 1Password ou similar.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {setup.isPending && <Skeleton className="mx-auto h-48 w-48 rounded-lg" />}

          {setup.data && (
            <>
              <div
                className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-white p-2 [&_svg]:h-full [&_svg]:w-full"
                // O SVG vem da própria API (não de entrada de usuário), montado
                // pela lib qrcode a partir do otpauth_uri.
                dangerouslySetInnerHTML={{ __html: setup.data.qr_svg }}
              />
              <p className="text-center text-xs text-muted-foreground">
                Não consegue escanear? Digite esta chave no app:{" "}
                <span className="font-mono break-all">{setup.data.secret}</span>
              </p>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="code">Código do app</Label>
            <div className="relative">
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
                disabled={confirm.isPending || !setup.data}
                aria-invalid={!!errors.code}
                className="text-center font-mono text-lg tracking-[0.5em]"
                {...register("code")}
              />
              <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={confirm.isPending || !setup.data}>
            {confirm.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ativando…
              </>
            ) : (
              "Ativar e entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
