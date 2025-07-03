-- AlterTable
ALTER TABLE "Experience" ALTER COLUMN "startDate" SET DATA TYPE TEXT,
ALTER COLUMN "endDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Individual" ADD COLUMN     "imageFileId" TEXT;

-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '1 hour';
