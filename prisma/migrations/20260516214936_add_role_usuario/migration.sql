-- CreateEnum
CREATE TYPE "RoleUsuario" AS ENUM ('GERENTE', 'VENDEDOR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "RoleUsuario" NOT NULL DEFAULT 'VENDEDOR';
