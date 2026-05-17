"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function ExcluirProposta({ propostaId }: { propostaId: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function excluir() {
    setCarregando(true);
    const res = await fetch(`/api/propostas/${propostaId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      setCarregando(false);
      setConfirmando(false);
      alert("Erro ao excluir proposta.");
    }
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-700">Confirmar exclusão?</span>
        <Button size="sm" variant="destructive" onClick={excluir} disabled={carregando}>
          {carregando ? "..." : "Sim"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirmando(false)} disabled={carregando}>
          Não
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmando(true)}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
