"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanTable } from "./plan-table";
import { usePlans } from "@/features/plans/hooks";

const TABS = [
  { value: "clinic", label: "Clínicas" },
  { value: "guardian", label: "Guardiões" },
] as const;

type Scope = (typeof TABS)[number]["value"];

export function PlanTableClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const scope = (searchParams.get("scope") ?? "clinic") as Scope;
  const search = searchParams.get("search") ?? "";
  const isActive = searchParams.get("isActive") ?? "all";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 10;

  const isActiveFilter = isActive === "true" ? true : isActive === "false" ? false : null;

  const { data, isLoading } = usePlans({
    search,
    isActive: isActiveFilter,
    page,
    pageSize,
    scope,
  });

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const current = { scope, search, isActive, page: String(page) };
      const merged = { ...current, ...updates };

      const params = new URLSearchParams();
      if (merged.scope && merged.scope !== "clinic") params.set("scope", merged.scope);
      if (merged.search) params.set("search", merged.search);
      if (merged.isActive !== "all") params.set("isActive", merged.isActive);
      if (merged.page !== "1") params.set("page", merged.page);

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, scope, search, isActive, page]
  );

  return (
    <div className="space-y-4">
      <Tabs
        value={scope}
        onValueChange={(v) => updateParams({ scope: v, page: "1", search: "", isActive: "all" })}
        className="flex-col"
      >
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <PlanTable
        plans={data?.plans ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        search={search}
        isActive={isActive}
        isLoading={isLoading}
        onSearchChange={(v) => updateParams({ search: v, page: "1" })}
        onActiveChange={(v) => updateParams({ isActive: v, page: "1" })}
        onPageChange={(v) => updateParams({ page: String(v) })}
      />
    </div>
  );
}
