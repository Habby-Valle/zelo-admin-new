"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";

import { useMfaVerify } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/authStore";
import { mfaChallengeSchema, type MfaChallengeSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Segunda etapa do login: o código do app autenticador ou um de recuperação. */
export function MfaChallengeForm() {
  const router = useRouter();
  const verify = useMfaVerify();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MfaChallengeSchema>({
    resolver: zodResolver(mfaChallengeSchema),
  });

  function onSubmit(data: MfaChallengeSchema) {
    verify.mutate(
      { code: data.code },
      {
        onSuccess: (result) => {
          setUser(result.user);
          router.push("/dashboard");
          router.refresh();
        },
      }
    );
  }

  const serverError = verify.error?.message;
  const isPending = verify.isPending || isSubmitting;
  // Bilhete morto (expirado ou queimado por tentativas): o caminho é refazer o login.
  const needsRestart = verify.error?.status === 401;

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
          <CardTitle className="text-2xl">Verificação em duas etapas</CardTitle>
          <CardDescription className="mt-1">
            Digite o código de 6 dígitos do seu app autenticador.
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

          <div className="space-y-1.5">
            <Label htmlFor="code">Código de verificação</Label>
            <div className="relative">
              <Input
                id="code"
                type="text"
                inputMode="text"
                maxLength={11}
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                disabled={isPending || needsRestart}
                aria-invalid={!!errors.code}
                className="text-center font-mono text-lg tracking-[0.3em]"
                {...register("code")}
              />
              <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isPending || needsRestart}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Sem acesso ao app? Use um dos seus códigos de recuperação no campo acima.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Voltar ao login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
