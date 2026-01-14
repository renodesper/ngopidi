-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "place_verifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "place_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "proof_link" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "place_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "place_verifications_place_id_idx" ON "place_verifications"("place_id");

-- CreateIndex
CREATE INDEX "place_verifications_user_id_idx" ON "place_verifications"("user_id");

-- CreateIndex
CREATE INDEX "place_verifications_status_idx" ON "place_verifications"("status");

-- AddForeignKey
ALTER TABLE "place_verifications" ADD CONSTRAINT "place_verifications_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_verifications" ADD CONSTRAINT "place_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
