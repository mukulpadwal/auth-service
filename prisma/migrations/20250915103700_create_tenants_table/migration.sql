/*
  Warnings:

  - Added the required column `tenantId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
