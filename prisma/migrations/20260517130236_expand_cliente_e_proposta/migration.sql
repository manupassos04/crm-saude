/*
  Warnings:

  - You are about to drop the column `email` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `valor_mensal` on the `propostas` table. All the data in the column will be lost.
  - Added the required column `telefone_celular1` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor_saude` to the `propostas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "FormaContratacao" AS ENUM ('COMPULSORIO', 'LIVRE_ADESAO');

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "email",
DROP COLUMN "telefone",
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "cnpj_mei" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "email_contato1" TEXT,
ADD COLUMN     "email_contato2" TEXT,
ADD COLUMN     "email_titular" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "razao_social" TEXT,
ADD COLUMN     "telefone_celular1" TEXT NOT NULL,
ADD COLUMN     "telefone_celular2" TEXT,
ADD COLUMN     "telefone_fix" TEXT,
ADD COLUMN     "tipo_pessoa" "TipoPessoa" NOT NULL DEFAULT 'PF';

-- AlterTable
ALTER TABLE "propostas" DROP COLUMN "valor_mensal",
ADD COLUMN     "aproveitamento_carencia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "forma_contratacao" "FormaContratacao" NOT NULL DEFAULT 'LIVRE_ADESAO',
ADD COLUMN     "proposta_numero_interno" TEXT,
ADD COLUMN     "proposta_numero_operadora" TEXT,
ADD COLUMN     "quantas_vidas" INTEGER,
ADD COLUMN     "valor_aditivos" DECIMAL(10,2),
ADD COLUMN     "valor_odonto" DECIMAL(10,2),
ADD COLUMN     "valor_saude" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "valor_sos" DECIMAL(10,2);
