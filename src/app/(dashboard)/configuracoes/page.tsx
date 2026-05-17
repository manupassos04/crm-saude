import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TabelaPrecoEditor } from "@/components/configuracoes/TabelaPrecoEditor";

async function getDados() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb || userDb.role !== "GERENTE") redirect("/");

  const precos = await prisma.tabelaPreco.findMany({
    where: { organizationId: userDb.organizationId },
    orderBy: [{ operadora: "asc" }, { plano: "asc" }, { faixaEtaria: "asc" }],
  });

  return precos.map((p) => ({
    id: p.id,
    operadora: p.operadora,
    plano: p.plano,
    faixaEtaria: p.faixaEtaria,
    acomodacao: p.acomodacao,
    coparticipacao: p.coparticipacao,
    valor: Number(p.valor),
  }));
}

export default async function ConfiguracoesPage() {
  const precos = await getDados();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tabela de preços por operadora — atualizada em {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>

      <TabelaPrecoEditor precos={precos} />
    </div>
  );
}
