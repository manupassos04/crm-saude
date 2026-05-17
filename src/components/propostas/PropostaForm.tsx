"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularComissao } from "@/lib/comissao";

interface Cliente { id: string; nome: string; }

interface PropostaPrefill {
  clienteId?: string;
  operadora?: string;
  plano?: string;
  acomodacao?: string;
  coparticipacao?: string;
  valorSaude?: string;
  quantasVidas?: string;
}

const sel = "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white";

interface PropostaInicial {
  id: string;
  clienteId: string;
  propostaNumeroInterno: string | null;
  propostaNumeroOperadora: string | null;
  operadora: string;
  plano: string;
  tipoPlano: string;
  formaContratacao: string;
  acomodacao: string;
  abrangencia: string;
  coparticipacao: boolean;
  reembolso: boolean;
  quantasVidas: number | null;
  valorSaude: number | string;
  valorOdonto: number | string | null;
  valorSOS: number | string | null;
  valorAditivos: number | string | null;
  temCarencia: boolean;
  aproveitamentoCarencia: boolean;
  tipoCarencia: string | null;
  prazoCarenciaDias: number | null;
  dataVigencia: Date | string;
  comissaoPorc: number | string;
  observacoes: string | null;
}

export function PropostaForm({
  clientes,
  clienteIdInicial,
  propostaInicial,
  prefill,
}: {
  clientes: Cliente[];
  clienteIdInicial?: string;
  propostaInicial?: PropostaInicial;
  prefill?: PropostaPrefill;
}) {
  const router = useRouter();
  const editando = !!propostaInicial;
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const vigencia = propostaInicial?.dataVigencia
    ? (typeof propostaInicial.dataVigencia === "string"
        ? propostaInicial.dataVigencia
        : (propostaInicial.dataVigencia as Date).toISOString()
      ).slice(0, 10)
    : "";

  const [form, setForm] = useState({
    clienteId: propostaInicial?.clienteId ?? prefill?.clienteId ?? clienteIdInicial ?? "",
    propostaNumeroInterno: propostaInicial?.propostaNumeroInterno ?? "",
    propostaNumeroOperadora: propostaInicial?.propostaNumeroOperadora ?? "",
    operadora: propostaInicial?.operadora ?? prefill?.operadora ?? "",
    plano: propostaInicial?.plano ?? prefill?.plano ?? "",
    tipoPlano: propostaInicial?.tipoPlano ?? "EMPRESARIAL",
    formaContratacao: propostaInicial?.formaContratacao ?? "LIVRE_ADESAO",
    acomodacao: propostaInicial?.acomodacao ?? prefill?.acomodacao ?? "ENFERMARIA",
    abrangencia: propostaInicial?.abrangencia ?? "NACIONAL",
    coparticipacao: propostaInicial ? String(propostaInicial.coparticipacao) : (prefill?.coparticipacao ?? "false"),
    reembolso: propostaInicial ? String(propostaInicial.reembolso) : "false",
    quantasVidas: propostaInicial?.quantasVidas ? String(propostaInicial.quantasVidas) : (prefill?.quantasVidas ?? ""),
    valorSaude: propostaInicial?.valorSaude ? String(propostaInicial.valorSaude) : (prefill?.valorSaude ?? ""),
    valorOdonto: propostaInicial?.valorOdonto ? String(propostaInicial.valorOdonto) : "",
    valorSOS: propostaInicial?.valorSOS ? String(propostaInicial.valorSOS) : "",
    valorAditivos: propostaInicial?.valorAditivos ? String(propostaInicial.valorAditivos) : "",
    temCarencia: propostaInicial ? String(propostaInicial.temCarencia) : "false",
    aproveitamentoCarencia: propostaInicial ? String(propostaInicial.aproveitamentoCarencia) : "false",
    tipoCarencia: propostaInicial?.tipoCarencia ?? "",
    prazoCarenciaDias: propostaInicial?.prazoCarenciaDias ? String(propostaInicial.prazoCarenciaDias) : "",
    dataVigencia: vigencia,
    comissaoPorc: propostaInicial?.comissaoPorc ? String(propostaInicial.comissaoPorc) : "5",
    observacoes: propostaInicial?.observacoes ?? "",
  });

  const temCarencia = form.temCarencia === "true";
  const valorTotal =
    (Number(form.valorSaude) || 0) +
    (Number(form.valorOdonto) || 0) +
    (Number(form.valorSOS) || 0) +
    (Number(form.valorAditivos) || 0);

  const comissaoPreview = form.valorSaude && form.comissaoPorc
    ? calcularComissao(valorTotal, Number(form.comissaoPorc))
    : 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const payload = {
      ...form,
      coparticipacao: form.coparticipacao === "true",
      reembolso: form.reembolso === "true",
      temCarencia: form.temCarencia === "true",
      aproveitamentoCarencia: form.aproveitamentoCarencia === "true",
      tipoCarencia: temCarencia ? form.tipoCarencia || null : null,
      prazoCarenciaDias: temCarencia && form.prazoCarenciaDias ? Number(form.prazoCarenciaDias) : null,
      quantasVidas: form.quantasVidas ? Number(form.quantasVidas) : null,
      valorOdonto: form.valorOdonto || null,
      valorSOS: form.valorSOS || null,
      valorAditivos: form.valorAditivos || null,
    };

    const res = await fetch(
      editando ? `/api/propostas/${propostaInicial.id}` : "/api/propostas",
      {
        method: editando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      router.push("/propostas");
      router.refresh();
    } else {
      setErro("Erro ao salvar proposta.");
    }
    setCarregando(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {/* Identificação */}
      <Card>
        <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="clienteId">Cliente *</Label>
            <select id="clienteId" name="clienteId" value={form.clienteId} onChange={handleChange} required className={sel}>
              <option value="">Selecione o cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="quantasVidas">Quantas vidas</Label>
            <Input id="quantasVidas" name="quantasVidas" type="number" min="1" value={form.quantasVidas} onChange={handleChange} placeholder="Ex: 3" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="propostaNumeroInterno">Proposta nº interno</Label>
            <Input id="propostaNumeroInterno" name="propostaNumeroInterno" value={form.propostaNumeroInterno} onChange={handleChange} placeholder="Numeração da corretora" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="propostaNumeroOperadora">Proposta nº operadora</Label>
            <Input id="propostaNumeroOperadora" name="propostaNumeroOperadora" value={form.propostaNumeroOperadora} onChange={handleChange} placeholder="Número gerado pela operadora" />
          </div>
        </CardContent>
      </Card>

      {/* Plano */}
      <Card>
        <CardHeader><CardTitle className="text-base">Plano</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="operadora">Operadora *</Label>
            <Input id="operadora" name="operadora" value={form.operadora} onChange={handleChange} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="plano">Plano *</Label>
            <Input id="plano" name="plano" value={form.plano} onChange={handleChange} required />
          </div>
          <div className="space-y-1">
            <Label>Tipo de plano</Label>
            <select name="tipoPlano" value={form.tipoPlano} onChange={handleChange} className={sel}>
              <option value="INDIVIDUAL">Individual</option>
              <option value="FAMILIAR">Familiar</option>
              <option value="EMPRESARIAL">Empresarial (PME)</option>
              <option value="COLETIVO_ADESAO">Coletivo por adesão</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Forma de contratação</Label>
            <select name="formaContratacao" value={form.formaContratacao} onChange={handleChange} className={sel}>
              <option value="LIVRE_ADESAO">Livre adesão</option>
              <option value="COMPULSORIO">Compulsório</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Acomodação</Label>
            <select name="acomodacao" value={form.acomodacao} onChange={handleChange} className={sel}>
              <option value="ENFERMARIA">Enfermaria</option>
              <option value="APARTAMENTO">Apartamento</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Abrangência</Label>
            <select name="abrangencia" value={form.abrangencia} onChange={handleChange} className={sel}>
              <option value="LOCAL">Local</option>
              <option value="ESTADUAL">Estadual</option>
              <option value="NACIONAL">Nacional</option>
              <option value="NACIONAL_COM_EXCLUSAO">Nacional com exclusão</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Coparticipação</Label>
            <select name="coparticipacao" value={form.coparticipacao} onChange={handleChange} className={sel}>
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Reembolso</Label>
            <select name="reembolso" value={form.reembolso} onChange={handleChange} className={sel}>
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Valores */}
      <Card>
        <CardHeader><CardTitle className="text-base">Valores mensais</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="valorSaude">Valor saúde (R$) *</Label>
            <Input id="valorSaude" name="valorSaude" type="number" step="0.01" value={form.valorSaude} onChange={handleChange} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="valorOdonto">Valor odonto (R$)</Label>
            <Input id="valorOdonto" name="valorOdonto" type="number" step="0.01" value={form.valorOdonto} onChange={handleChange} placeholder="0,00" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="valorSOS">Valor SOS (R$)</Label>
            <Input id="valorSOS" name="valorSOS" type="number" step="0.01" value={form.valorSOS} onChange={handleChange} placeholder="0,00" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="valorAditivos">Valor aditivos (R$)</Label>
            <Input id="valorAditivos" name="valorAditivos" type="number" step="0.01" value={form.valorAditivos} onChange={handleChange} placeholder="0,00" />
          </div>
          <div className="md:col-span-2 bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">Total mensal</span>
            <span className="text-lg font-bold text-gray-900">
              R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Carência */}
      <Card>
        <CardHeader><CardTitle className="text-base">Carência</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Tem carência?</Label>
            <select name="temCarencia" value={form.temCarencia} onChange={handleChange} className={sel}>
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Aproveitamento de carências</Label>
            <select name="aproveitamentoCarencia" value={form.aproveitamentoCarencia} onChange={handleChange} className={sel}>
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </div>
          {temCarencia && (
            <>
              <div className="space-y-1">
                <Label>Tipo de carência</Label>
                <select name="tipoCarencia" value={form.tipoCarencia} onChange={handleChange} className={sel}>
                  <option value="">Selecione</option>
                  <option value="PARCIAL">Parcial</option>
                  <option value="TOTAL">Total</option>
                  <option value="ISENTO_PORTABILIDADE">Isento — portabilidade</option>
                  <option value="ISENTO_MUDANCA_PLANO">Isento — mudança de plano</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Prazo (dias)</Label>
                <Input name="prazoCarenciaDias" type="number" min="0" value={form.prazoCarenciaDias} onChange={handleChange} placeholder="Ex: 180" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Comissão e vigência */}
      <Card>
        <CardHeader><CardTitle className="text-base">Comissão e vigência</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="dataVigencia">Data de vigência *</Label>
            <Input id="dataVigencia" name="dataVigencia" type="date" value={form.dataVigencia} onChange={handleChange} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="comissaoPorc">Comissão (%)</Label>
            <Input id="comissaoPorc" name="comissaoPorc" type="number" step="0.1" value={form.comissaoPorc} onChange={handleChange} />
          </div>
          <div className="md:col-span-2 bg-rose-50 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-rose-600 font-medium">Comissão estimada</span>
            <span className="text-lg font-bold text-rose-600">
              R$ {comissaoPreview.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
        <CardContent>
          <Textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={3} placeholder="Anotações adicionais..." />
        </CardContent>
      </Card>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex gap-3">
        <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={carregando}>
          {carregando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar proposta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
