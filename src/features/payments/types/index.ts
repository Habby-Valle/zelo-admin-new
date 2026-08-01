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
