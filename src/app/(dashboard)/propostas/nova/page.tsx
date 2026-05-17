import { PropostaForm } from "@/components/propostas/PropostaForm";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getClientes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) return [];
  return prisma.cliente.findMany({
    where: { organizationId: userDb.organizationId },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
}

export default async function NovaPropostaPage({
  searchParams,
}: {
  searchParams: Promise<{
    clienteId?: string;
    operadora?: string;
    plano?: string;
    acomodacao?: string;
    coparticipacao?: string;
    valorSaude?: string;
    quantasVidas?: string;
  }>;
}) {
  const [clientes, params] = await Promise.all([getClientes(), searchParams]);
  const { clienteId, ...prefillRest } = params;
  const hasPrefill = Object.values(prefillRest).some(Boolean);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nova proposta</h1>
      <PropostaForm
        clientes={clientes}
        clienteIdInicial={clienteId}
        prefill={hasPrefill ? { clienteId, ...prefillRest } : undefined}
      />
    </div>
  );
}
