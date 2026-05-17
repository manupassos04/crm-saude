"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";

const FAIXAS = ["0-18", "19-23", "24-28", "29-33", "34-38", "39-43", "44-48", "49-53", "54-58", "59+"] as const;
const FAIXAS_LABEL: Record<string, string> = {
  "0-18": "0-18", "19-23": "19-23", "24-28": "24-28", "29-33": "29-33",
  "34-38": "34-38", "39-43": "39-43", "44-48": "44-48", "49-53": "49-53",
  "54-58": "54-58", "59+": "59+",
};
const ACOMODACAO_LABEL: Record<string, string> = {
  SEMI_PRIVATIVO: "Semi-Priv.", PRIVATIVO: "Privativo", SEM_ACOMODACAO: "Ambulatorial",
};

interface Preco {
  id: string;
  operadora: string;
  plano: string;
  faixaEtaria: string;
  acomodacao: string;
  coparticipacao: boolean;
  valor: number;
}

interface PlanoGrupo {
  plano: string;
  acomodacao: string;
  coparticipacao: boolean;
  precos: Record<string, Preco>;
}

interface OperadoraGrupo {
  operadora: string;
  planos: PlanoGrupo[];
}

function agrupar(precos: Preco[]): OperadoraGrupo[] {
  const ops: Record<string, Record<string, PlanoGrupo>> = {};
  for (const p of precos) {
    if (!ops[p.operadora]) ops[p.operadora] = {};
    const key = `${p.plano}||${p.acomodacao}||${p.coparticipacao}`;
    if (!ops[p.operadora][key]) {
      ops[p.operadora][key] = { plano: p.plano, acomodacao: p.acomodacao, coparticipacao: p.coparticipacao, precos: {} };
    }
    ops[p.operadora][key].precos[p.faixaEtaria] = p;
  }
  return Object.entries(ops).map(([operadora, planos]) => ({
    operadora,
    planos: Object.values(planos),
  }));
}

function CelulaPreco({ preco }: { preco: Preco }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(preco.valor.toFixed(2));
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvar() {
    setSalvando(true);
    const res = await fetch(`/api/tabela-precos/${preco.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: Number(valor) }),
    });
    setSalvando(false);
    if (res.ok) {
      setEditando(false);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    }
  }

  if (editando) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="h-7 w-24 text-xs px-1"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") salvar(); if (e.key === "Escape") setEditando(false); }}
        />
        <Button size="icon" className="h-7 w-7 bg-green-500 hover:bg-green-600" onClick={salvar} disabled={salvando}>
          <Check className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditando(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditando(true)}
      className={`group flex items-center gap-1 text-sm hover:text-rose-600 transition-colors ${salvo ? "text-green-600 font-medium" : ""}`}
    >
      R$ {Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100" />
    </button>
  );
}

export function TabelaPrecoEditor({ precos }: { precos: Preco[] }) {
  const [operadoraAberta, setOperadoraAberta] = useState<string | null>(null);
  const grupos = agrupar(precos);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Clique em qualquer valor para editar. Pressione Enter para salvar.</p>
      {grupos.map(({ operadora, planos }) => (
        <div key={operadora} className="border rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            onClick={() => setOperadoraAberta(operadoraAberta === operadora ? null : operadora)}
          >
            <span className="font-semibold text-gray-900">{operadora}</span>
            <span className="text-sm text-gray-500">{planos.length} plano{planos.length !== 1 ? "s" : ""}</span>
          </button>

          {operadoraAberta === operadora && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-t">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Plano</th>
                    <th className="text-left px-2 py-2 font-medium text-gray-600">Acomod.</th>
                    <th className="text-left px-2 py-2 font-medium text-gray-600">Copat.</th>
                    {FAIXAS.map((f) => (
                      <th key={f} className="text-center px-2 py-2 font-medium text-gray-600">{FAIXAS_LABEL[f]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planos.map((plano, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{plano.plano}</td>
                      <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{ACOMODACAO_LABEL[plano.acomodacao] ?? plano.acomodacao}</td>
                      <td className="px-2 py-2 text-gray-500">{plano.coparticipacao ? "Sim" : "Não"}</td>
                      {FAIXAS.map((faixa) => {
                        const preco = plano.precos[faixa];
                        return (
                          <td key={faixa} className="px-2 py-1.5 text-center">
                            {preco ? <CelulaPreco preco={preco} /> : <span className="text-gray-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
