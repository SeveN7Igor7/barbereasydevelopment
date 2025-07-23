-- AlterEnum
BEGIN;
CREATE TYPE "StatusAgendamento_new" AS ENUM ('AGENDAMENTO_PROGRAMADO', 'ATENDIDO', 'CANCELADO');
ALTER TABLE "Agendamento" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Agendamento" ALTER COLUMN "status" TYPE "StatusAgendamento_new" USING ("status"::text::"StatusAgendamento_new");
ALTER TYPE "StatusAgendamento" RENAME TO "StatusAgendamento_old";
ALTER TYPE "StatusAgendamento_new" RENAME TO "StatusAgendamento";
DROP TYPE "StatusAgendamento_old";
ALTER TABLE "Agendamento" ALTER COLUMN "status" SET DEFAULT 'AGENDAMENTO_PROGRAMADO';
COMMIT;

