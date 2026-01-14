-- AlterTable
ALTER TABLE "places" ADD COLUMN     "submitter_id" UUID;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
