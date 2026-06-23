import { apiFetchClient } from "@/lib/api-client";
import type { Media } from "@/types";

export async function uploadMedia(
  formData: FormData
): Promise<{ success: boolean; data?: Media; error?: string }> {
  try {
    const data = await apiFetchClient<Media>("/media/upload/", {
      method: "POST",
      body: formData,
    });
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao fazer upload da imagem";
    return { success: false, error: message };
  }
}

export async function deleteMedia(mediaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiFetchClient<void>(`/media/${mediaId}/`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao remover imagem";
    return { success: false, error: message };
  }
}
