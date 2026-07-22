"use client";

import { useMemo } from "react";
import { useSubscriptions, useSubscriptionStats } from "@/features/subscriptions/hooks";
import { SubscriptionsTable } from "./subscriptions-table";
import { StatsCards } from "./stats-cards";
import type { SubscriptionListItem } from "@/features/subscriptions/types";

export function SubscriptionsPageClient() {
  const { data: subsData, isLoading: subsLoading } = useSubscriptions({
    page_size: 50,
  });
  const { data: stats } = useSubscriptionStats();

  const subscriptions: SubscriptionListItem[] = useMemo(() => {
    if (!subsData?.subscriptions) return [];

    const now = new Date();

    return subsData.subscriptions.map((sub) => {
      const endDate = sub.end_date ? new Date(sub.end_date) : null;
      const daysRemaining = endDate
        ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...sub,
        days_remaining: sub.status === "active" || sub.status === "trial" ? daysRemaining : null,
      };
    });
  }, [subsData]);

  const statsData = useMemo(
    () => ({
      total: stats?.total ?? 0,
      active: stats?.active ?? 0,
      trial: stats?.trial ?? 0,
      expired: stats?.expired ?? 0,
      cancelled: stats?.cancelled ?? 0,
      plan_distribution: stats?.plan_distribution ?? [],
    }),
    [stats]
  );

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
    );
  }

  return (
    <>
      <StatsCards stats={statsData} />
      <div className="mt-6">
        <SubscriptionsTable subscriptions={subscriptions} />
      </div>
    </>
  );
}
