"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPhone } from "@/lib/format";
import { acceptInvitation } from "@/app/(auth)/accept-invitation/actions";

const formSchema = z
  .object({
    name: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  clinic_admin: "Admin de Clínica",
  guardian: "Responsável",
  caregiver: "Cuidador",
  family: "Familiar",
};

interface InviteInfo {
  email: string;
  role: string;
  clinic_name: string | null;
}

export function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);

  const needsProfile = inviteInfo?.role === "super_admin";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) {
      setLoadingInvite(false);
      return;
    }

    fetch(`/api/proxy/invites/accept/${token}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Convite inválido ou expirado");
        return res.json();
      })
      .then((data) => {
        setInviteInfo(data);
        setLoadingInvite(false);
      })
      .catch(() => {
        setServerError("Link inválido ou expirado. Solicite um novo convite.");
        setLoadingInvite(false);
      });
  }, [token]);

  async function onSubmit(data: FormValues) {
    setServerError(null);
    if (!token) return;

    if (needsProfile && (!data.name || !data.phone)) {
      setServerError("Preencha todos os campos obrigatórios.");
      return;
    }

    const result = await acceptInvitation(token, {
      password: data.password,
      confirmPassword: data.confirmPassword,
      name: data.name || undefined,
      phone: data.phone || undefined,
    });
    if (!result.success) {
      setServerError(result.error ?? "Erro desconhecido");
      return;
    }
    setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Zelo
              </p>
              <p className="text-sm leading-none font-semibold">Painel Administrativo</p>
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
            <CardDescription className="mt-1">Sua conta foi ativada com sucesso.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              <AlertDescription>Você já pode fazer login com sua senha.</AlertDescription>
            </Alert>

            <Button onClick={() => router.push("/login")} className="w-full">
              Ir para login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!token || (!loadingInvite && serverError && !inviteInfo)) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Zelo
              </p>
              <p className="text-sm leading-none font-semibold">Painel Administrativo</p>
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl">Sessão inválida</CardTitle>
            <CardDescription className="mt-1">
              {serverError ?? "Este link é inválido ou expirou. Solicite um novo convite."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Button onClick={() => router.push("/login")} className="w-full">
            Ir para login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loadingInvite) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Zelo
              </p>
              <p className="text-sm leading-none font-semibold">Painel Administrativo</p>
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl">Carregando...</CardTitle>
            <CardDescription className="mt-1">Verificando seu convite.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <UserPlus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Zelo
            </p>
            <p className="text-sm leading-none font-semibold">Painel Administrativo</p>
          </div>
        </div>

        <div>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription className="mt-1">
            {inviteInfo?.email && (
              <span className="block text-sm font-medium text-foreground">
                {inviteInfo.email}
              </span>
            )}
            {inviteInfo?.role && (
              <span className="mt-1 block text-xs text-muted-foreground">
                Perfil: {ROLE_LABELS[inviteInfo.role] ?? inviteInfo.role}
              </span>
            )}
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

          {needsProfile && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.phone}
                  value={formatPhone(watch("phone") ?? "")}
                  onChange={(e) => setValue("phone", e.target.value, { shouldValidate: true })}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.confirmPassword}
                className="pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}