"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/lib/api/media.service";

interface ImageUploadProps {
  currentUrl?: string | null;
  onMediaChange: (mediaId: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ currentUrl, onMediaChange, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const result = await uploadMedia(formData);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao fazer upload");
        return;
      }

      const media = result.data!;
      setPreviewUrl(media.url ?? null);
      onMediaChange(media.id);
      toast.success("Imagem salva com sucesso!");
    } catch {
      toast.error("Erro ao fazer upload");
    } finally {
      setUploading(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemove() {
    setRemoving(true);
    try {
      setPreviewUrl(null);
      onMediaChange(null);
      toast.success("Imagem removida.");
    } finally {
      setRemoving(false);
    }
  }

  const isBusy = uploading || removing;

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            sizes="96px"
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
        )}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isBusy}
        >
          <Upload className="mr-2 h-4 w-4" />
          {previewUrl ? "Alterar imagem" : "Carregar imagem"}
        </Button>
        {previewUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleRemove}
            disabled={disabled || isBusy}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover imagem
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
