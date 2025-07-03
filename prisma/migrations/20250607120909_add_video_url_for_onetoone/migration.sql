-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '1 hour';

-- AlterTable
ALTER TABLE "ShareableLink" ADD COLUMN     "videoUrl" TEXT;
