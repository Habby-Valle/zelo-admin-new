import { apiFetchClient } from "@/lib/api-client";
import type { BroadcastNotification } from "@/features/broadcast/types";

export async function fetchBroadcasts(): Promise<BroadcastNotification[]> {
  return apiFetchClient<BroadcastNotification[]>("/broadcasts/");
}

export async function createBroadcast(data: {
  title: string;
  message: string;
  target_role: string;
}): Promise<BroadcastNotification> {
  return apiFetchClient<BroadcastNotification>("/broadcasts/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
