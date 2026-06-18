export { DashboardView } from "./components/dashboard-view"
export { getDashboardApi } from "./services/dashboard.service"
export { useDashboard } from "./hooks"
export { KpiCard, KpiCardSkeleton } from "./components/kpi-card"
export {
  ClinicStatsTable,
  ClinicStatsTableSkeleton,
} from "./components/clinic-stats-table"
export {
  RecentActivityTable,
  RecentActivityTableSkeleton,
} from "./components/recent-activity-table"
export { RevenueForecastCards } from "./components/revenue-forecast-cards"
export { RevenueChart } from "./components/revenue-chart"
export type {
  DashboardKPIs,
  ClinicStat,
  RecentActivity,
  RevenueMetrics,
  DashboardData,
} from "./types"
