-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Applied', 'Interviewing', 'Offer', 'Rejected');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('Internship', 'FullTime', 'PartTime');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "job_type" "JobType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Applied',
    "applied_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);
