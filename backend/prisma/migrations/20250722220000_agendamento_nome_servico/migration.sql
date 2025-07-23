-- AlterTable
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_servicoId_fkey";

-- AlterTable
ALTER TABLE "Agendamento" DROP COLUMN "servicoId";
ALTER TABLE "Agendamento" ADD COLUMN "nomeServico" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Agendamento" ADD COLUMN "precoServico" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Servico" DROP COLUMN IF EXISTS "agendamentos";

