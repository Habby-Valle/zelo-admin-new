export interface BroadcastNotification {
  id: number;
  title: string;
  message: string;
  target_role: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_by: number | null;
  created_by_name: string | null;
  sent_at: string | null;
  created_at: string;
}
