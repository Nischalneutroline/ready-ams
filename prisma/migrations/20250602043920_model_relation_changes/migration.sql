/*
  Warnings:

  - You are about to drop the column `eventId` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the `Availability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ResourceToService` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[individualId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[meetingId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressId]` on the table `Individual` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceId` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PHYSICAL', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ONE_TO_ONE', 'GENERAL');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('SINGLE_SLOT', 'DAILY_SLOTS', 'MULTI_DAY_SLOTS');

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_individualId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_userId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_eventId_fkey";

-- DropForeignKey
ALTER TABLE "_ResourceToService" DROP CONSTRAINT "_ResourceToService_A_fkey";

-- DropForeignKey
ALTER TABLE "_ResourceToService" DROP CONSTRAINT "_ResourceToService_B_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "individualId" TEXT;

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "meetingId" TEXT;

-- AlterTable
ALTER TABLE "Individual" ADD COLUMN     "addressId" INTEGER,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "eventId",
ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "serviceId" TEXT NOT NULL,
ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '1 hour';

-- AlterTable
ALTER TABLE "ReminderOffset" ALTER COLUMN "sendOffset" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "individualId" TEXT,
ADD COLUMN     "isMultiResource" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxBookings" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "type" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "ServiceTime" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Availability";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "_ResourceToService";

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "individualId" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCertification" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareableLink" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "appointmentId" TEXT,
    "serviceId" TEXT,
    "resourceId" TEXT,
    "serviceTimeId" TEXT,
    "date" TIMESTAMP(3),
    "dateRangeEnd" TIMESTAMP(3),
    "linkType" "LinkType" NOT NULL DEFAULT 'SINGLE_SLOT',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ShareableLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareableLink_slug_key" ON "ShareableLink"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Address_individualId_key" ON "Address"("individualId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_meetingId_key" ON "Appointment"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "Individual_addressId_key" ON "Individual"("addressId");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_individualId_fkey" FOREIGN KEY ("individualId") REFERENCES "Individual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_individualId_fkey" FOREIGN KEY ("individualId") REFERENCES "Individual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAddress" ADD CONSTRAINT "BusinessAddress_supportId_fkey" FOREIGN KEY ("supportId") REFERENCES "SupportBusinessDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_individualId_fkey" FOREIGN KEY ("individualId") REFERENCES "Individual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareableLink" ADD CONSTRAINT "ShareableLink_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareableLink" ADD CONSTRAINT "ShareableLink_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareableLink" ADD CONSTRAINT "ShareableLink_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareableLink" ADD CONSTRAINT "ShareableLink_serviceTimeId_fkey" FOREIGN KEY ("serviceTimeId") REFERENCES "ServiceTime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
