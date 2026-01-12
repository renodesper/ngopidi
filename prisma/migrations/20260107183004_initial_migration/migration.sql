-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE "WifiStability" AS ENUM ('poor', 'average', 'good', 'excellent');
CREATE TYPE "WifiPolicy" AS ENUM ('free', 'purchase_required', 'time_limited');
CREATE TYPE "OutletDensity" AS ENUM ('few', 'moderate', 'many');
CREATE TYPE "SeatingType" AS ENUM ('single_table', 'communal_table', 'bar_seating', 'sofa');
CREATE TYPE "TableSize" AS ENUM ('small', 'medium', 'large');
CREATE TYPE "NoiseLevel" AS ENUM ('quiet', 'moderate', 'noisy');
CREATE TYPE "MusicVolume" AS ENUM ('low', 'medium', 'loud');
CREATE TYPE "CrowdLevel" AS ENUM ('empty', 'normal', 'crowded');
CREATE TYPE "StayPolicy" AS ENUM ('no_limit', 'soft_limit', 'explicit_limit');
CREATE TYPE "TemperatureComfort" AS ENUM ('cold', 'comfortable', 'warm');
CREATE TYPE "SmokingArea" AS ENUM ('none', 'separate', 'indoor');
CREATE TYPE "CommonVisitor" AS ENUM ('students', 'remote_workers', 'meetings', 'casual_visitors');
CREATE TYPE "PlaceStatus" AS ENUM ('PENDING', 'SUBMITTED', 'UNVERIFIED', 'VERIFIED_ADMIN', 'VERIFIED_USER', 'REJECTED');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- Users
CREATE TABLE "users" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Accounts
CREATE TABLE "accounts" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- Sessions
CREATE TABLE "sessions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "session_token" TEXT NOT NULL,
    "user_id" uuid NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Verification Tokens
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Places
CREATE TABLE "places" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geo" geography(Point,4326),
    "price_level" INTEGER,
    "average_drink_price" INTEGER,
    "minimum_spend" INTEGER,
    "wifi_available" BOOLEAN NOT NULL DEFAULT false,
    "wifi_speed" INTEGER,
    "wifi_stability" "WifiStability",
    "wifi_policy" "WifiPolicy",
    "power_outlets_available" BOOLEAN NOT NULL DEFAULT false,
    "power_outlet_density" "OutletDensity",
    "table_size" "TableSize",
    "seating_types" "SeatingType"[],
    "noise_level" "NoiseLevel",
    "music_volume" "MusicVolume",
    "crowd_level" "CrowdLevel",
    "laptop_friendly" BOOLEAN,
    "stay_policy" "StayPolicy",
    "meeting_friendly" BOOLEAN,
    "call_friendly" BOOLEAN,
    "work_friendly_score" DOUBLE PRECISION,
    "air_conditioning" BOOLEAN,
    "temperature_comfort" "TemperatureComfort",
    "restroom_available" BOOLEAN,
    "prayer_room_available" BOOLEAN NOT NULL DEFAULT false,
    "smoking_area" "SmokingArea",
    "parking_available" BOOLEAN,
    "opening_hours" TEXT,
    "busy_hours" TEXT,
    "common_visitors" "CommonVisitor"[],
    "status" "PlaceStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- Place Images
CREATE TABLE "place_images" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "url" TEXT NOT NULL,
    "place_id" uuid NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "place_images_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

CREATE INDEX "places_status_idx" ON "places"("status");
CREATE INDEX "places_laptop_friendly_idx" ON "places"("laptop_friendly");
CREATE INDEX "places_latitude_longitude_idx" ON "places"("latitude", "longitude");
CREATE INDEX "places_wifi_available_power_outlets_available_idx"
  ON "places"("wifi_available", "power_outlets_available");
CREATE INDEX "places_noise_level_work_friendly_score_idx"
  ON "places"("noise_level", "work_friendly_score");

CREATE INDEX "place_images_place_id_idx" ON "place_images"("place_id");

-- Foreign Keys
ALTER TABLE "accounts"
ADD CONSTRAINT "accounts_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessions"
ADD CONSTRAINT "sessions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "place_images"
ADD CONSTRAINT "place_images_place_id_fkey"
FOREIGN KEY ("place_id") REFERENCES "places"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- PostGIS Index
CREATE INDEX idx_places_geo ON "places" USING GIST ("geo");

-- Trigram Search
CREATE INDEX "places_name_trgm_idx"
ON "places" USING GIN ("name" gin_trgm_ops);

CREATE INDEX "places_address_trgm_idx"
ON "places" USING GIN ("address" gin_trgm_ops);

-- Geo Trigger
CREATE OR REPLACE FUNCTION places_set_geo()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geo := ST_SetSRID(
      ST_MakePoint(NEW.longitude, NEW.latitude),
      4326
    )::geography;
  ELSE
    NEW.geo := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_places_geo
BEFORE INSERT OR UPDATE ON "places"
FOR EACH ROW EXECUTE FUNCTION places_set_geo();

-- Auto updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
