export interface PaymentRecord {
  id: number;
  invoice_id: number;
  clinic_id: number;
  clinic_name: string;
  plan_name: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  billing_cycle: string;
  paid_at: string | null;
  stripe_payment_intent_id: string;
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

export interface InvoiceRecord {
  id: number;
  owner_id: number;
  owner_name: string;
  owner_type: "clinic" | "guardian";
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: string;
  invoice_url: string;
  paid_at: string | null;
  created_at: string;
}
