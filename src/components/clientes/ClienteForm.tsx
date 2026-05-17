"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const sel = "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white";

interface Dependente {
  nome: string; dataNascimento: string; parentesco: string; cpf: string; sexo: string;
}
const depVazio = (): Dependente => ({ nome: "", dataNascimento: "", parentesco: "", cpf: "", sexo: "" });

interface ClienteInicial {
  id: string;
  tipoPessoa: string;
  nome: string; cpf: string | null; dataNascimento: string | null;
  sexo: string | null; estadoCivil: string | null; profissao: string | null;
  cnpj: string | null; cnpjMei: boolean; razaoSocial: string | null;
  telefoneCelular1: string; telefoneCelular2: string | null; telefoneFix: string | null;
  emailTitular: string | null; emailContato1: string | null; emailContato2: string | null;
  cep: string | null; logradouro: string | null; numero: string | null;
  complemento: string | null; bairro: string | null; cidade: string | null; uf: string | null;
  cidadePreferencia: string | null;
  dependentes: { nome: string; dataNascimento: Date | string; parentesco: string; cpf: string | null; sexo: string | null }[];
}

function isoDate(d: Date | string | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

export function ClienteForm({ clienteInicial }: { clienteInicial?: ClienteInicial }) {
  const router = useRouter();
  const editando = !!clienteInicial;

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<"PF" | "PJ">(
    (clienteInicial?.tipoPessoa as "PF" | "PJ") ?? "PF"
  );
  const [form, setForm] = useState({
    nome: clienteInicial?.nome ?? "",
    cpf: clienteInicial?.cpf ?? "",
    dataNascimento: isoDate(clienteInicial?.dataNascimento ?? null),
    sexo: clienteInicial?.sexo ?? "",
    estadoCivil: clienteInicial?.estadoCivil ?? "",
    profissao: clienteInicial?.profissao ?? "",
    cnpj: clienteInicial?.cnpj ?? "",
    cnpjMei: clienteInicial?.cnpjMei ? "true" : "false",
    razaoSocial: clienteInicial?.razaoSocial ?? "",
    telefoneCelular1: clienteInicial?.telefoneCelular1 ?? "",
    telefoneCelular2: clienteInicial?.telefoneCelular2 ?? "",
    telefoneFix: clienteInicial?.telefoneFix ?? "",
    emailTitular: clienteInicial?.emailTitular ?? "",
    emailContato1: clienteInicial?.emailContato1 ?? "",
    emailContato2: clienteInicial?.emailContato2 ?? "",
    cep: clienteInicial?.cep ?? "",
    logradouro: clienteInicial?.logradouro ?? "",
    numero: clienteInicial?.numero ?? "",
    complemento: clienteInicial?.complemento ?? "",
    bairro: clienteInicial?.bairro ?? "",
    cidade: clienteInicial?.cidade ?? "",
    uf: clienteInicial?.uf ?? "",
    cidadePreferencia: clienteInicial?.cidadePreferencia ?? "",
  });
  const [dependentes, setDependentes] = useState<Dependente[]>(
    clienteInicial?.dependentes.map((d) => ({
      nome: d.nome,
      dataNascimento: isoDate(d.dataNascimento),
      parentesco: d.parentesco,
      cpf: d.cpf ?? "",
      sexo: d.sexo ?? "",
    })) ?? []
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleDepChange(i: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setDependentes((prev) => prev.map((d, idx) => idx === i ? { ...d, [e.target.name]: e.target.value } : d));
  }

  async function buscarCep(cep: string) {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length !== 8) return;
    const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.erro) return;
    setForm((prev) => ({
      ...prev,
      logradouro: data.logradouro ?? prev.logradouro,
      bairro: data.bairro ?? prev.bairro,
      cidade: data.localidade ?? prev.cidade,
      uf: data.uf ?? prev.uf,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const payload = { ...form, tipoPessoa, cnpjMei: form.cnpjMei === "true", dependentes };

    const res = await fetch(
      editando ? `/api/clientes/${clienteInicial.id}` : "/api/clientes",
      {
        method: editando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      router.push(editando ? `/clientes/${clienteInicial.id}` : "/clientes");
      router.refresh();
    } else {
      setErro("Erro ao salvar cliente. Tente novamente.");
    }
    setCarregando(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {/* Tipo de pessoa */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tipo de pessoa</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          {(["PF", "PJ"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipoPessoa(t)}
              className={`px-6 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                tipoPessoa === t ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-600"
              }`}
            >
              {t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Dados do titular */}
      <Card>
        <CardHeader><CardTitle className="text-base">{tipoPessoa === "PF" ? "Dados pessoais" : "Dados da empresa"}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tipoPessoa === "PF" ? (
            <>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" name="nome" value={form.nome} onChange={handleChange} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dataNascimento">Data de nascimento</Label>
                <Input id="dataNascimento" name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sexo">Sexo</Label>
                <select id="sexo" name="sexo" value={form.sexo} onChange={handleChange} className={sel}>
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="estadoCivil">Estado civil</Label>
                <select id="estadoCivil" name="estadoCivil" value={form.estadoCivil} onChange={handleChange} className={sel}>
                  <option value="">Selecione</option>
                  <option value="SOLTEIRO">Solteiro(a)</option>
                  <option value="CASADO">Casado(a)</option>
                  <option value="DIVORCIADO">Divorciado(a)</option>
                  <option value="VIUVO">Viúvo(a)</option>
                  <option value="UNIAO_ESTAVEL">União estável</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="profissao">Profissão</Label>
                <Input id="profissao" name="profissao" value={form.profissao} onChange={handleChange} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="razaoSocial">Razão social *</Label>
                <Input id="razaoSocial" name="razaoSocial" value={form.razaoSocial} onChange={handleChange} required={tipoPessoa === "PJ"} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input id="cnpj" name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" required={tipoPessoa === "PJ"} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nome">Nome do responsável *</Label>
                <Input id="nome" name="nome" value={form.nome} onChange={handleChange} required />
              </div>
              <div className="space-y-1">
                <Label>MEI?</Label>
                <select name="cnpjMei" value={form.cnpjMei} onChange={handleChange} className={sel}>
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader><CardTitle className="text-base">Contato</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="telefoneCelular1">Celular 1 *</Label>
            <Input id="telefoneCelular1" name="telefoneCelular1" value={form.telefoneCelular1} onChange={handleChange} placeholder="(00) 00000-0000" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="telefoneCelular2">Celular 2</Label>
            <Input id="telefoneCelular2" name="telefoneCelular2" value={form.telefoneCelular2} onChange={handleChange} placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="telefoneFix">Telefone fixo</Label>
            <Input id="telefoneFix" name="telefoneFix" value={form.telefoneFix} onChange={handleChange} placeholder="(00) 0000-0000" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emailTitular">E-mail titular</Label>
            <Input id="emailTitular" name="emailTitular" type="email" value={form.emailTitular} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emailContato1">E-mail contato 1</Label>
            <Input id="emailContato1" name="emailContato1" type="email" value={form.emailContato1} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emailContato2">E-mail contato 2</Label>
            <Input id="emailContato2" name="emailContato2" type="email" value={form.emailContato2} onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep" name="cep" value={form.cep}
              onChange={handleChange}
              onBlur={(e) => buscarCep(e.target.value)}
              placeholder="00000-000"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input id="logradouro" name="logradouro" value={form.logradouro} onChange={handleChange} placeholder="Rua, Av..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" name="numero" value={form.numero} onChange={handleChange} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" name="complemento" value={form.complemento} onChange={handleChange} placeholder="Apto, sala..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" name="bairro" value={form.bairro} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" name="cidade" value={form.cidade} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="uf">UF</Label>
            <select id="uf" name="uf" value={form.uf} onChange={handleChange} className={sel}>
              <option value="">UF</option>
              {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label htmlFor="cidadePreferencia">Cidade de preferência para atendimento</Label>
            <Input id="cidadePreferencia" name="cidadePreferencia" value={form.cidadePreferencia} onChange={handleChange} placeholder="Ex: São Paulo, Campinas" />
          </div>
        </CardContent>
      </Card>

      {/* Dependentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dependentes</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => setDependentes((p) => [...p, depVazio()])}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {dependentes.length === 0 && <p className="text-sm text-gray-400">Nenhum dependente.</p>}
          {dependentes.map((dep, i) => (
            <div key={i} className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3 relative">
              <button type="button" onClick={() => setDependentes((p) => p.filter((_, idx) => idx !== i))}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="space-y-1 md:col-span-2">
                <Label>Nome completo *</Label>
                <Input name="nome" value={dep.nome} onChange={(e) => handleDepChange(i, e)} required />
              </div>
              <div className="space-y-1">
                <Label>Data de nascimento *</Label>
                <Input name="dataNascimento" type="date" value={dep.dataNascimento} onChange={(e) => handleDepChange(i, e)} required />
              </div>
              <div className="space-y-1">
                <Label>Parentesco *</Label>
                <select name="parentesco" value={dep.parentesco} onChange={(e) => handleDepChange(i, e)} className={sel} required>
                  <option value="">Selecione</option>
                  <option value="CONJUGE">Cônjuge</option>
                  <option value="FILHO">Filho</option>
                  <option value="FILHA">Filha</option>
                  <option value="PAI">Pai</option>
                  <option value="MAE">Mãe</option>
                  <option value="IRMAO">Irmão</option>
                  <option value="IRMA">Irmã</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>CPF</Label>
                <Input name="cpf" value={dep.cpf} onChange={(e) => handleDepChange(i, e)} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-1">
                <Label>Sexo</Label>
                <select name="sexo" value={dep.sexo} onChange={(e) => handleDepChange(i, e)} className={sel}>
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex gap-3">
        <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={carregando}>
          {carregando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar cliente"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
