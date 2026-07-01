export interface DashboardKPIs {
  totalClinics: number;
  activeClinics: number;
  totalPatients: number;
  totalUsers: number;
  totalCaregivers: number;
  totalAdmins: number;
  totalGuardians: number;
  activeShifts: number;
  checklistsToday: number;
  activeSosAlerts: number;
  acknowledgedSosAlerts: number;
  avgSatisfaction: number | null;
  nps: number | null;
  totalRatings: number;
}

export interface ClinicStat {
  id: string;
  name: string;
  status: string;
  patientCount: number;
  caregiverCount: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  entity: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  expected30Days: number;
  forecast: { month: string; revenue: number }[];
  activeSubscriptions: number;
  trialSubscriptions: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  clinicStats: ClinicStat[];
  revenue: RevenueMetrics;
  recentActivity: RecentActivity[];
}
