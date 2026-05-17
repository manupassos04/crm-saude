"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPCOES = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "APROVADA", label: "Aprovada" },
  { value: "RECUSADA", label: "Recusada" },
  { value: "CANCELADA", label: "Cancelada" },
];

const COR: Record<string, string> = {
  PENDENTE: "text-yellow-700 bg-yellow-50 border-yellow-200",
  APROVADA: "text-green-700 bg-green-50 border-green-200",
  RECUSADA: "text-red-700 bg-red-50 border-red-200",
  CANCELADA: "text-gray-600 bg-gray-50 border-gray-200",
};

export function StatusSelect({ propostaId, statusAtual }: { propostaId: string; statusAtual: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(statusAtual);
  const [salvando, setSalvando] = useState(false);

  async function handleChange(novoStatus: string) {
    if (novoStatus === status) return;
    setSalvando(true);

    const res = await fetch(`/api/propostas/${propostaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    if (res.ok) {
      setStatus(novoStatus);
      router.refresh();
    }

    setSalvando(false);
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={salvando}
      className={`text-xs font-medium border rounded-full px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors ${COR[status]} ${salvando ? "opacity-50" : ""}`}
    >
      {OPCOES.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
