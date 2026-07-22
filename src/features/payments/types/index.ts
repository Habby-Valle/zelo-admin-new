export interface PaymentRecord {
  id: string;
  invoice_id: string;
  clinic_id: string;
  clinic_name: string;
  plan_name: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  billing_cycle: string;
  paid_at: string | null;
  asaas_payment_id: string;
  created_at: string;
}

export interface PaymentStats {
  total: number;
  succeeded: number;
  failed: number;
  pending: number;
  refunded: number;
  total_revenue: number;
}

export interface PlanPaymentRecord {
  id: number;
  asaas_payment_id: string;
  clinic_id: string | number;
  clinic_name: string | null;
  plan_name: string | null;
  billing_cycle: string | null;
  amount: string;
  status: string;
  status_display: string;
  payment_method: string;
  paid_at: string | null;
  due_date: string;
  created_at: string;
  receipt_number: string | null;
}
