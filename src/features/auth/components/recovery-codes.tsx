"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecoveryCodesProps {
  codes: string[];
}

/**
 * Mostra os códigos de recuperação. É a única vez que eles aparecem: a API
 * guarda só o hash, então não há como reexibi-los depois.
 */
export function RecoveryCodes({ codes }: RecoveryCodesProps) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([`Códigos de recuperação — Zelo\n\n${codes.join("\n")}\n`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zelo-codigos-recuperacao.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Guarde estes códigos num lugar seguro. Cada um serve <strong>uma única vez</strong> para
          entrar sem o app autenticador, e eles não podem ser exibidos de novo.
        </AlertDescription>
      </Alert>

      <ul className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-4">
        {codes.map((code) => (
          <li key={code} className="text-center font-mono text-sm tracking-wider">
            {code}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={copyAll}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </>
          )}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={download}>
          <Download className="mr-2 h-4 w-4" />
          Baixar
        </Button>
      </div>
    </div>
  );
}
