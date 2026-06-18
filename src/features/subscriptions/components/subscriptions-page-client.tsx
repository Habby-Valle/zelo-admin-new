"use client"

import { useMemo } from "react"
import {
  useSubscriptions,
  useSubscriptionStats,
  useGuardianSubscriptions,
} from "@/features/subscriptions/hooks"
import { SubscriptionsTable } from "./subscriptions-table"
import { GuardianSubscriptionsTable } from "./guardian-subscriptions-table"
import { StatsCards } from "./stats-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SubscriptionListItem } from "@/features/subscriptions/types"

export function SubscriptionsPageClient() {
  const { data: subsData, isLoading: subsLoading } = useSubscriptions({
    page_size: 50,
  })
  const { data: stats } = useSubscriptionStats()
  const { data: guardianData, isLoading: guardianLoading } =
    useGuardianSubscriptions({ page_size: 50 })

  const subscriptions: SubscriptionListItem[] = useMemo(() => {
    if (!subsData?.subscriptions) return []

    const now = new Date()

    return subsData.subscriptions.map((sub) => {
      const endDate = sub.end_date ? new Date(sub.end_date) : null
      const daysRemaining = endDate
        ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        ...sub,
        days_remaining:
          sub.status === "active" || sub.status === "trial"
            ? daysRemaining
            : null,
      }
    })
  }, [subsData])

  const statsData = useMemo(
    () => ({
      total: stats?.total ?? 0,
      active: stats?.active ?? 0,
      trial: stats?.trial ?? 0,
      expired: stats?.expired ?? 0,
      cancelled: stats?.cancelled ?? 0,
      plan_distribution: stats?.plan_distribution ?? [],
      guardian_total: stats?.guardian_total ?? 0,
      guardian_active: stats?.guardian_active ?? 0,
      guardian_free: stats?.guardian_free ?? 0,
      guardian_trial: stats?.guardian_trial ?? 0,
      guardian_cancelled: stats?.guardian_cancelled ?? 0,
    }),
    [stats]
  )

  const guardianSubscriptions = guardianData?.subscriptions ?? []

  if (subsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  return (
    <>
      <StatsCards stats={statsData} />
      <Tabs defaultValue="clinics" className="flex-col mt-6">
        <TabsList>
          <TabsTrigger value="clinics">
            Clínicas{" "}
            <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
              {subscriptions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="guardians">
            Guardiões{" "}
            <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
              {guardianSubscriptions.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clinics" className="mt-4">
          <SubscriptionsTable subscriptions={subscriptions} />
        </TabsContent>
        <TabsContent value="guardians" className="mt-4">
          {guardianLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          ) : (
            <GuardianSubscriptionsTable subscriptions={guardianSubscriptions} />
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
