/*
  Warnings:

  - You are about to drop the column `data_nascimento` on the `cotacoes` table. All the data in the column will be lost.
  - You are about to drop the column `planos` on the `cotacoes` table. All the data in the column will be lost.
  - Added the required column `vidas` to the `cotacoes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cotacoes" DROP COLUMN "data_nascimento",
DROP COLUMN "planos",
ADD COLUMN     "resultado" JSONB,
ADD COLUMN     "vidas" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "tabela_precos" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "operadora" TEXT NOT NULL,
    "plano" TEXT NOT NULL,
    "faixa_etaria" TEXT NOT NULL,
    "acomodacao" TEXT NOT NULL DEFAULT 'SEMI_PRIVATIVO',
    "coparticipacao" BOOLEAN NOT NULL DEFAULT false,
    "valor" DECIMAL(10,2) NOT NULL,
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabela_precos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tabela_precos_organization_id_operadora_plano_faixa_etaria__key" ON "tabela_precos"("organization_id", "operadora", "plano", "faixa_etaria", "acomodacao", "coparticipacao");

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabela_precos" ADD CONSTRAINT "tabela_precos_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
