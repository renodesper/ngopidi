/*
  Warnings:

  - You are about to drop the column `admin_notes` on the `place_verifications` table. All the data in the column will be lost.
  - You are about to drop the `place_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "place_images" DROP CONSTRAINT "place_images_place_id_fkey";

-- AlterTable
ALTER TABLE "place_verifications" DROP COLUMN "admin_notes",
ADD COLUMN     "notes" TEXT;

-- DropTable
DROP TABLE "place_images";
