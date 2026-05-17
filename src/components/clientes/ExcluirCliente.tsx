"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function ExcluirCliente({ clienteId, nomeCliente }: { clienteId: string; nomeCliente: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function excluir() {
    setCarregando(true);
    const res = await fetch(`/api/clientes/${clienteId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/clientes");
      router.refresh();
    } else {
      setCarregando(false);
      setConfirmando(false);
      alert("Erro ao excluir cliente.");
    }
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
        <span className="text-sm text-red-700">
          Excluir <strong>{nomeCliente}</strong> e todas as propostas? Esta ação não pode ser desfeita.
        </span>
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
    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmando(true)}>
      <Trash2 className="h-4 w-4 mr-1" />
      Excluir cliente
    </Button>
  );
}
