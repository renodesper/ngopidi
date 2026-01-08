-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateEnum
CREATE TYPE "WifiStability" AS ENUM ('poor', 'average', 'good', 'excellent');

-- CreateEnum
CREATE TYPE "WifiPolicy" AS ENUM ('free', 'purchase_required', 'time_limited');

-- CreateEnum
CREATE TYPE "OutletDensity" AS ENUM ('few', 'moderate', 'many');

-- CreateEnum
CREATE TYPE "SeatingType" AS ENUM ('single_table', 'communal_table', 'bar_seating', 'sofa');

-- CreateEnum
CREATE TYPE "TableSize" AS ENUM ('small', 'medium', 'large');

-- CreateEnum
CREATE TYPE "NoiseLevel" AS ENUM ('quiet', 'moderate', 'noisy');

-- CreateEnum
CREATE TYPE "MusicVolume" AS ENUM ('low', 'medium', 'loud');

-- CreateEnum
CREATE TYPE "CrowdLevel" AS ENUM ('empty', 'normal', 'crowded');

-- CreateEnum
CREATE TYPE "StayPolicy" AS ENUM ('no_limit', 'soft_limit', 'explicit_limit');

-- CreateEnum
CREATE TYPE "TemperatureComfort" AS ENUM ('cold', 'comfortable', 'warm');

-- CreateEnum
CREATE TYPE "SmokingArea" AS ENUM ('none', 'separate', 'indoor');

-- CreateEnum
CREATE TYPE "CommonVisitor" AS ENUM ('students', 'remote_workers', 'meetings', 'casual_visitors');

-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('PENDING', 'SUBMITTED', 'UNVERIFIED', 'VERIFIED_ADMIN', 'VERIFIED_USER', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geo" geography(Point,4326),
    "priceLevel" INTEGER,
    "averageDrinkPrice" INTEGER,
    "minimumSpend" INTEGER,
    "wifiAvailable" BOOLEAN NOT NULL DEFAULT false,
    "wifiSpeed" INTEGER,
    "wifiStability" "WifiStability",
    "wifiPolicy" "WifiPolicy",
    "powerOutletsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "powerOutletDensity" "OutletDensity",
    "tableSize" "TableSize",
    "seatingTypes" "SeatingType"[],
    "noiseLevel" "NoiseLevel",
    "musicVolume" "MusicVolume",
    "crowdLevel" "CrowdLevel",
    "laptopFriendly" BOOLEAN,
    "stayPolicy" "StayPolicy",
    "meetingFriendly" BOOLEAN,
    "callFriendly" BOOLEAN,
    "workFriendlyScore" DOUBLE PRECISION,
    "airConditioning" BOOLEAN,
    "temperatureComfort" "TemperatureComfort",
    "restroomAvailable" BOOLEAN,
    "prayerRoomAvailable" BOOLEAN NOT NULL DEFAULT false,
    "smokingArea" "SmokingArea",
    "parkingAvailable" BOOLEAN,
    "openingHours" TEXT,
    "busyHours" TEXT,
    "commonVisitors" "CommonVisitor"[],
    "status" "PlaceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "places_status_idx" ON "places"("status");

-- CreateIndex
CREATE INDEX "places_laptopFriendly_idx" ON "places"("laptopFriendly");

-- CreateIndex
CREATE INDEX "places_latitude_longitude_idx" ON "places"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "places_wifiAvailable_powerOutletsAvailable_idx" ON "places"("wifiAvailable", "powerOutletsAvailable");

-- CreateIndex
CREATE INDEX "places_noiseLevel_workFriendlyScore_idx" ON "places"("noiseLevel", "workFriendlyScore");

-- CreateIndex
CREATE INDEX "place_images_placeId_idx" ON "place_images"("placeId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_images" ADD CONSTRAINT "place_images_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX idx_places_geo ON places USING GIST (geo);

-- CreateIndex
CREATE INDEX "places_name_trgm_idx" ON "places" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "places_address_trgm_idx" ON "places" USING GIN ("address" gin_trgm_ops);

-- CreateTrigger
CREATE OR REPLACE FUNCTION places_set_geo()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geo := ST_SetSRID(ST_MakePoint(
      NEW.longitude,
      NEW.latitude
    ), 4326)::geography;
  ELSE
    NEW.geo := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_places_geo
BEFORE INSERT OR UPDATE ON places
FOR EACH ROW EXECUTE FUNCTION places_set_geo();
