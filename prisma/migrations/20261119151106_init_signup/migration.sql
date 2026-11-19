-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Segment" AS ENUM ('launch_waitlist', 'beta_tester');

-- CreateTable
CREATE TABLE "signup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "segment" "Segment" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "consent_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3),
    "sync_attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "signup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "signup_email_segment_key" ON "signup"("email", "segment");

