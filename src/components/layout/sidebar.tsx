"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  ClipboardList,
  BarChart3,
  Settings,
  Shield,
  CreditCard,
  DollarSign,
  CalendarClock,
  Bug,
  TestTube,
  CheckCircle,
  Megaphone,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Environment = "development" | "homologation" | "production";

const envConfig: Record<
  Environment,
  { label: string; icon: typeof Bug; color: string; bgColor: string }
> = {
  development: {
    label: "DESENVOLVIMENTO",
    icon: Bug,
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  homologation: {
    label: "HOMOLOGAÇÃO",
    icon: TestTube,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  production: {
    label: "PRODUÇÃO",
    icon: CheckCircle,
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
};

function EnvironmentBadge() {
  const env = (process.env.NEXT_PUBLIC_APP_ENV ?? "development") as Environment;
  const config = envConfig[env] ?? envConfig.development;
  const EnvIcon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase",
        config.color,
        config.bgColor
      )}
    >
      <EnvIcon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clínicas", href: "/clinics", icon: Building2 },
  { label: "Assinaturas", href: "/subscriptions", icon: CreditCard },
  { label: "Pagamentos", href: "/payments", icon: DollarSign },
  { label: "Planos", href: "/plans", icon: CheckCircle },
  { label: "Usuários", href: "/users", icon: Users },
  { label: "Pacientes", href: "/patients", icon: UserRound },
  { label: "Turnos", href: "/shifts", icon: CalendarClock },
  { label: "Checklists", href: "/checklists", icon: ClipboardList },
  { label: "Relatórios", href: "/reports", icon: BarChart3 },
  { label: "Logs de Auditoria", href: "/audit-logs", icon: Shield },
  { label: "Broadcast", href: "/broadcast", icon: Megaphone },
  { label: "Feedbacks", href: "/feedback", icon: MessageSquare },
  { label: "SOS", href: "/sos", icon: AlertTriangle },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          <Image
            src="/logo.png"
            alt="Zelo"
            fill
            sizes="36px"
            className="object-contain p-1"
            unoptimized
          />
        </div>
        <div className="min-w-0 leading-none">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Zelo
          </p>
          <p className="truncate text-sm font-bold">Super Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">v0.1.0</p>
          <EnvironmentBadge />
        </div>
      </div>
    </aside>
  );
}
