"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchBroadcasts, createBroadcast } from "@/features/broadcast/services"

export const broadcastKeys = {
  all: ["broadcasts"] as const,
  lists: () => [...broadcastKeys.all, "list"] as const,
  list: () => [...broadcastKeys.lists()] as const,
}

export function useBroadcasts() {
  return useQuery({
    queryKey: broadcastKeys.list(),
    queryFn: fetchBroadcasts,
  })
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title: string
      message: string
      target_role: string
    }) => createBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastKeys.lists() })
    },
  })
}
