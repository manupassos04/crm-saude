"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function ExcluirCotacao({ cotacaoId }: { cotacaoId: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function excluir() {
    setCarregando(true);
    const res = await fetch(`/api/cotacoes/${cotacaoId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/cotacoes");
      router.refresh();
    } else {
      setCarregando(false);
      setConfirmando(false);
      alert("Erro ao excluir cotação.");
    }
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
        <span className="text-sm text-red-700">Excluir esta cotação?</span>
        <Button size="sm" variant="destructive" onClick={excluir} disabled={carregando}>
          {carregando ? "Excluindo..." : "Confirmar"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirmando(false)} disabled={carregando}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setConfirmando(true)}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
