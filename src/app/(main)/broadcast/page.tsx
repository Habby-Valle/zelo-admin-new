import { Megaphone } from "lucide-react";
import { BroadcastClient } from "@/features/broadcast/components";

export const metadata = {
  title: "Notificações Broadcast",
};

export default function BroadcastPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Megaphone className="h-6 w-6" />
          Notificações Broadcast
        </h1>
        <p className="mt-1 text-muted-foreground">
          Envie notificações em massa para usuários da plataforma.
        </p>
      </div>

      <BroadcastClient />
    </div>
  );
}
