export type ServiceInvoiceStatus = "pending" | "paid" | "cancelled";

export interface ServiceInvoice {
  id: string;
  invoice_number: string;
  contract: string;
  contract_number: string;
  patient_name: string;
  payer_name: string;
  clinic: string;
  clinic_name: string;
  period_start: string;
  period_end: string;
  due_date: string | null;
  total_amount: string;
  status: ServiceInvoiceStatus;
  status_display?: string;
  paid_at: string | null;
  notes: string;
  pix_status: string | null;
  items: ServiceInvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface ServiceInvoiceLineItem {
  id: string;
  date: string;
  description: string;
  hours: string;
  hourly_rate: string;
  night_surcharge: string;
  amount: string;
}

export interface ServiceInvoicePage {
  invoices: ServiceInvoice[];
  total: number;
}

export interface ServiceInvoiceStats {
  total_pending: string;
  total_paid: string;
  pending_count: number;
  paid_count: number;
  total_overdue: string;
  overdue_count: number;
}
