-- CreateEnum
CREATE TYPE "TipoMensagem" AS ENUM ('USER', 'AI');

-- CreateTable
CREATE TABLE "ConversaIA" (
    "id" SERIAL NOT NULL,
    "telefone" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" "TipoMensagem" NOT NULL,
    "sessao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversaIA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversaIA_telefone_createdAt_idx" ON "ConversaIA"("telefone", "createdAt");

