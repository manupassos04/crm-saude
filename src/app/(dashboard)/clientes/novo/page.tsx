import { ClienteForm } from "@/components/clientes/ClienteForm";

export default function NovoClientePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo cliente</h1>
      <ClienteForm />
    </div>
  );
}
