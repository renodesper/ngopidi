/*
  Warnings:

  - The `status` column on the `place_verifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "place_verifications" DROP COLUMN "status",
ADD COLUMN     "status" "PlaceStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "VerificationStatus";

-- CreateIndex
CREATE INDEX "place_verifications_status_idx" ON "place_verifications"("status");
