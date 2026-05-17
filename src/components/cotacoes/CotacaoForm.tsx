"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const FAIXAS = ["0-18", "19-23", "24-28", "29-33", "34-38", "39-43", "44-48", "49-53", "54-58", "59+"] as const;
const FAIXAS_LABEL: Record<string, string> = {
  "0-18": "0 a 18 anos", "19-23": "19 a 23", "24-28": "24 a 28",
  "29-33": "29 a 33", "34-38": "34 a 38", "39-43": "39 a 43",
  "44-48": "44 a 48", "49-53": "49 a 53", "54-58": "54 a 58", "59+": "59 ou mais",
};

interface Cliente { id: string; nome: string; }

export function CotacaoForm({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [vidas, setVidas] = useState<Record<string, string>>(
    Object.fromEntries(FAIXAS.map((f) => [f, ""]))
  );

  const totalVidas = FAIXAS.reduce((acc, f) => acc + (Number(vidas[f]) || 0), 0);

  function handleClienteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setClienteId(id);
    if (id) {
      const c = clientes.find((c) => c.id === id);
      if (c) setNomeCliente(c.nome);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totalVidas === 0) { setErro("Informe ao menos uma vida."); return; }
    setErro("");
    setCarregando(true);

    const vidasNum = Object.fromEntries(FAIXAS.map((f) => [f, Number(vidas[f]) || 0]));

    const res = await fetch("/api/cotacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomeCliente, clienteId: clienteId || null, vidas: vidasNum, observacoes }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/cotacoes/${data.id}`);
    } else {
      setErro("Erro ao gerar cotação.");
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Cliente (opcional)</Label>
            <select
              value={clienteId}
              onChange={handleClienteChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="">Sem vínculo com cliente cadastrado</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="nomeCliente">Nome para a cotação *</Label>
            <Input
              id="nomeCliente"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Ex: Empresa ABC — cotação maio/2026"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Vidas por faixa etária</CardTitle>
            {totalVidas > 0 && (
              <span className="text-sm font-medium text-rose-600">{totalVidas} vida{totalVidas > 1 ? "s" : ""} no total</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {FAIXAS.map((faixa) => (
              <div key={faixa} className="space-y-1">
                <Label className="text-xs text-gray-500">{FAIXAS_LABEL[faixa]}</Label>
                <Input
                  type="number"
                  min="0"
                  value={vidas[faixa]}
                  onChange={(e) => setVidas((prev) => ({ ...prev, [faixa]: e.target.value }))}
                  placeholder="0"
                  className="text-center"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informações adicionais, preferências do cliente..."
            rows={3}
          />
        </CardContent>
      </Card>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex gap-3">
        <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={carregando}>
          {carregando ? "Calculando..." : "Gerar comparativo"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
