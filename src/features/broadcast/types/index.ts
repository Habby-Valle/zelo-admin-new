export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  target_role: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_by: string | null;
  created_by_name: string | null;
  sent_at: string | null;
  created_at: string;
}
