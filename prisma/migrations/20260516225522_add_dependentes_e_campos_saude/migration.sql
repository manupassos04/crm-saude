-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL');

-- CreateEnum
CREATE TYPE "Parentesco" AS ENUM ('CONJUGE', 'FILHO', 'FILHA', 'PAI', 'MAE', 'IRMAO', 'IRMA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoPlano" AS ENUM ('INDIVIDUAL', 'FAMILIAR', 'EMPRESARIAL', 'COLETIVO_ADESAO');

-- CreateEnum
CREATE TYPE "Acomodacao" AS ENUM ('ENFERMARIA', 'APARTAMENTO');

-- CreateEnum
CREATE TYPE "Abrangencia" AS ENUM ('LOCAL', 'ESTADUAL', 'NACIONAL', 'NACIONAL_COM_EXCLUSAO');

-- CreateEnum
CREATE TYPE "TipoCarencia" AS ENUM ('PARCIAL', 'TOTAL', 'ISENTO_PORTABILIDADE', 'ISENTO_MUDANCA_PLANO');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "cidade_preferencia" TEXT,
ADD COLUMN     "estado_civil" "EstadoCivil",
ADD COLUMN     "profissao" TEXT,
ADD COLUMN     "sexo" "Sexo",
ADD COLUMN     "uf" TEXT;

-- AlterTable
ALTER TABLE "propostas" ADD COLUMN     "abrangencia" "Abrangencia" NOT NULL DEFAULT 'NACIONAL',
ADD COLUMN     "acomodacao" "Acomodacao" NOT NULL DEFAULT 'ENFERMARIA',
ADD COLUMN     "coparticipacao" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prazo_carencia_dias" INTEGER,
ADD COLUMN     "reembolso" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tem_carencia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tipo_carencia" "TipoCarencia",
ADD COLUMN     "tipo_plano" "TipoPlano" NOT NULL DEFAULT 'INDIVIDUAL';

-- CreateTable
CREATE TABLE "dependentes" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "parentesco" "Parentesco" NOT NULL,
    "cpf" TEXT,
    "sexo" "Sexo",
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dependentes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dependentes" ADD CONSTRAINT "dependentes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
