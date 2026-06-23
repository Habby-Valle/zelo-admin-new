"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFeedback, useUpdateFeedbackStatus } from "@/features/feedback/hooks";
import { formatDateTime } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  bug: "Bug",
  feature: "Melhoria",
  compliment: "Elogio",
  other: "Outro",
};

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  bug: "destructive",
  feature: "default",
  compliment: "secondary",
  other: "outline",
};

const STATUS_LABELS: Record<string, string> = {
  received: "Recebido",
  in_review: "Em Análise",
  resolved: "Resolvido",
  closed: "Fechado",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  received: "secondary",
  in_review: "outline",
  resolved: "default",
  closed: "outline",
};

interface FeedbackDetailClientProps {
  id: string;
}

export function FeedbackDetailClient({ id }: FeedbackDetailClientProps) {
  const router = useRouter();
  const { data: feedback, isLoading } = useFeedback(id);
  const updateStatus = useUpdateFeedbackStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Feedback não encontrado.
        </CardContent>
      </Card>
    );
  }

  const statusActions = [
    { status: "received", label: "Marcar como Recebido" },
    { status: "in_review", label: "Marcar como Em Análise" },
    { status: "resolved", label: "Marcar como Resolvido" },
    { status: "closed", label: "Fechar" },
  ].filter((a) => a.status !== feedback.status);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push("/feedback")}>
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Badge variant={TYPE_VARIANTS[feedback.type] ?? "outline"}>
                {TYPE_LABELS[feedback.type] ?? feedback.type}
              </Badge>
              {feedback.subject}
            </CardTitle>
          </div>
          <Badge variant={STATUS_VARIANTS[feedback.status] ?? "outline"} className="text-sm">
            {STATUS_LABELS[feedback.status] ?? feedback.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Enviado por</p>
              <p className="font-medium">
                {feedback.user_name ?? <span className="italic">Anônimo</span>}
              </p>
              {feedback.user_email && (
                <p className="text-sm text-muted-foreground">{feedback.user_email}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clínica</p>
              <p className="font-medium">{feedback.clinic_name ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">{formatDateTime(feedback.created_at)}</p>
            </div>
            {feedback.page_url && (
              <div>
                <p className="text-sm text-muted-foreground">Página</p>
                <a
                  href={feedback.page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {feedback.page_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm text-muted-foreground">Mensagem</p>
            <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
              {feedback.message}
            </div>
          </div>

          {feedback.media.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Anexos</p>
                <div className="flex flex-wrap gap-2">
                  {feedback.media.map((m) => (
                    <a
                      key={m.id}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg border bg-muted px-3 py-2 text-sm hover:bg-accent"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {m.original_filename}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusActions.map((action) => (
              <Button
                key={action.status}
                variant="outline"
                size="sm"
                onClick={() =>
                  updateStatus.mutate({
                    id: feedback.id,
                    status: action.status,
                  })
                }
                disabled={updateStatus.isPending}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
