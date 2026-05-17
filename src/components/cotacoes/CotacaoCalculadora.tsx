"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFaixaANS } from "@/lib/comissao";

const PLANOS_EXEMPLO = [
  { operadora: "Amil", plano: "S450", valorBase: 450 },
  { operadora: "Amil", plano: "S680", valorBase: 680 },
  { operadora: "Bradesco Saúde", plano: "Nacional Flex", valorBase: 520 },
  { operadora: "Bradesco Saúde", plano: "Top Nacional", valorBase: 890 },
  { operadora: "SulAmérica", plano: "Especial 100", valorBase: 380 },
  { operadora: "SulAmérica", plano: "Clássico", valorBase: 610 },
];

export function CotacaoCalculadora() {
  const router = useRouter();
  const [nomeCliente, setNomeCliente] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [planosSelecionados, setPlanosSelecionados] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const faixa = dataNascimento ? getFaixaANS(new Date(dataNascimento)) : null;

  const planosComValor = PLANOS_EXEMPLO.map((p) => ({
    ...p,
    valorAjustado: faixa
      ? parseFloat((p.valorBase * faixa.fator).toFixed(2))
      : p.valorBase,
  }));

  function togglePlano(key: string) {
    setPlanosSelecionados((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleSalvar() {
    if (!nomeCliente || !dataNascimento) {
      setErro("Preencha o nome e a data de nascimento.");
      return;
    }
    setErro("");
    setCarregando(true);

    const planosSalvos = planosComValor.filter((p) =>
      planosSelecionados.includes(`${p.operadora}-${p.plano}`)
    );

    const res = await fetch("/api/cotacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomeCliente,
        dataNascimento,
        planos: planosSalvos,
      }),
    });

    if (res.ok) {
      router.push("/cotacoes");
      router.refresh();
    } else {
      setErro("Erro ao salvar cotação.");
    }

    setCarregando(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Dados do beneficiário</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Nome do cliente</Label>
            <Input
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-1">
            <Label>Data de nascimento</Label>
            <Input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
            />
          </div>
          {faixa && (
            <div className="md:col-span-2">
              <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">
                Faixa ANS: {faixa.label} — fator {faixa.fator}×
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {faixa && (
        <Card>
          <CardHeader>
            <CardTitle>Planos disponíveis</CardTitle>
            <p className="text-sm text-gray-500">Selecione os planos para incluir na cotação</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {planosComValor.map((p) => {
                const key = `${p.operadora}-${p.plano}`;
                const selecionado = planosSelecionados.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => togglePlano(key)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      selecionado
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-gray-900">{p.operadora}</p>
                    <p className="text-sm text-gray-500">{p.plano}</p>
                    <p className="text-lg font-bold text-rose-600 mt-1">
                      R$ {p.valorAjustado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      <span className="text-xs text-gray-400 font-normal">/mês</span>
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex gap-3">
        <Button
          onClick={handleSalvar}
          className="bg-rose-500 hover:bg-rose-600"
          disabled={carregando || planosSelecionados.length === 0}
        >
          {carregando ? "Salvando..." : `Salvar cotação (${planosSelecionados.length} plano${planosSelecionados.length !== 1 ? "s" : ""})`}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
