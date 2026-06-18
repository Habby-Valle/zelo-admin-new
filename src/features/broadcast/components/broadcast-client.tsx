"use client"

import { useState } from "react"
import { Loader2, Megaphone, Send, Users } from "lucide-react"
import { toast } from "sonner"
import { useBroadcasts, useCreateBroadcast } from "@/features/broadcast/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/format"

const ROLE_LABELS: Record<string, string> = {
  all: "Todos (Cuidadores, Familiares, Emerg., Admins)",
  caregiver: "Cuidadores",
  family: "Familiares",
  emergency_contact: "Contatos de Emerg.",
  clinic_admin: "Admins de Clínica",
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  sending: "secondary",
  sent: "default",
  failed: "destructive",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  sending: "Enviando",
  sent: "Enviado",
  failed: "Falhou",
}

export function BroadcastClient() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetRole, setTargetRole] = useState<string>("all")

  const { data: notifications, isLoading } = useBroadcasts()
  const createBroadcast = useCreateBroadcast()

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem")
      return
    }

    createBroadcast.mutate(
      { title: title.trim(), message: message.trim(), target_role: targetRole },
      {
        onSuccess: (result) => {
          const recipientCount = result?.recipient_count ?? 0
          toast.success(`Notificação criada para ${recipientCount} destinatários`)
          setTitle("")
          setMessage("")
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Erro ao enviar notificação")
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Nova Notificação
          </CardTitle>
          <CardDescription>
            Envie uma notificação por email para os usuários selecionados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Manutenção programada"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: O sistema estará em manutenção..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Destinatários</Label>
            <Select value={targetRole} onValueChange={(v) => setTargetRole(v ?? "all")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <Users className="mr-2 inline h-4 w-4" />
                  Todos (Cuidadores, Familiares, Emerg., Admins)
                </SelectItem>
                <SelectItem value="clinic_admin">Admins de Clínica</SelectItem>
                <SelectItem value="caregiver">Cuidadores</SelectItem>
                <SelectItem value="family">Familiares</SelectItem>
                <SelectItem value="emergency_contact">
                  Contatos de Emerg.
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSend} disabled={createBroadcast.isPending} className="gap-2">
            {createBroadcast.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {createBroadcast.isPending ? "Enviando..." : "Enviar Notificação"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Configure a variável RESEND_API_KEY no .env.local para ativar o
            envio real de emails.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Histórico de Envios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma notificação enviada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{n.title}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {n.message.slice(0, 100)}
                      {n.message.length > 100 ? "..." : ""}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{ROLE_LABELS[n.target_role] ?? n.target_role}</span>
                      <span>&bull;</span>
                      <span>{n.recipient_count} destinatários</span>
                      <span>&bull;</span>
                      <span>
                        {n.sent_count}/{n.recipient_count} enviados
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={STATUS_COLORS[n.status] ?? "outline"}>
                      {STATUS_LABELS[n.status] ?? n.status}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(n.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
