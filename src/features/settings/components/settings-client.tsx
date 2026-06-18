"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, User, Settings } from "lucide-react"
import { AccountSettings } from "./account-settings"
import { SystemSettingsTab } from "./system-settings"
import { LgpdSettings } from "./lgpd-settings"
import { useLgpdConfig } from "@/features/settings/hooks"

export function SettingsClient() {
  const { data: lgpdConfig } = useLgpdConfig()

  return (
    <Tabs defaultValue="account" className="space-y-6 flex-col">
      <TabsList>
        <TabsTrigger value="account" className="gap-2">
          <User className="h-4 w-4" />
          Conta
        </TabsTrigger>
        <TabsTrigger value="lgpd" className="gap-2">
          <Shield className="h-4 w-4" />
          LGPD / Privacidade
        </TabsTrigger>
        <TabsTrigger value="system" className="gap-2">
          <Settings className="h-4 w-4" />
          Sistema
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>

      <TabsContent value="lgpd">
        <LgpdSettings
          config={lgpdConfig ?? {
            retention_policies: [],
            encryption_key_configured: false,
            encryption_statuses: [],
          }}
        />
      </TabsContent>

      <TabsContent value="system">
        <SystemSettingsTab />
      </TabsContent>
    </Tabs>
  )
}
