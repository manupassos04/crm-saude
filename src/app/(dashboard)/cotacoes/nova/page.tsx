import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CotacaoForm } from "@/components/cotacoes/CotacaoForm";

async function getClientes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const userDb = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!userDb) redirect("/login");
  return prisma.cliente.findMany({
    where: { organizationId: userDb.organizationId },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
}

export default async function NovaCotacaoPage() {
  const clientes = await getClientes();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nova cotação</h1>
      <CotacaoForm clientes={clientes} />
    </div>
  );
}
