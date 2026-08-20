export interface PlanPaymentRecord {
  id: number;
  /** Id da cobrança no gateway. Não carrega o nome de nenhuma integração:
   *  trocar de gateway não deveria renomear a tela. */
  gateway_payment_id: string;
  /** Fatura hospedada pelo gateway — o link que o admin abre para conferir. */
  hosted_invoice_url: string;
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
