import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PropostaForm } from "@/components/propostas/PropostaForm";

async function getData(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) redirect("/login");

  const [proposta, clientes] = await Promise.all([
    prisma.proposta.findFirst({ where: { id, organizationId: userDb.organizationId } }),
    prisma.cliente.findMany({
      where: { organizationId: userDb.organizationId },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return { proposta, clientes };
}

export default async function EditarPropostaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { proposta, clientes } = await getData(id);
  if (!proposta) notFound();

  const propostaInicial = {
    ...proposta,
    valorSaude: Number(proposta.valorSaude),
    valorOdonto: proposta.valorOdonto != null ? Number(proposta.valorOdonto) : null,
    valorSOS: proposta.valorSOS != null ? Number(proposta.valorSOS) : null,
    valorAditivos: proposta.valorAditivos != null ? Number(proposta.valorAditivos) : null,
    comissaoPorc: Number(proposta.comissaoPorc),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/propostas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar proposta</h1>
      </div>
      <PropostaForm clientes={clientes} propostaInicial={propostaInicial} />
    </div>
  );
}
