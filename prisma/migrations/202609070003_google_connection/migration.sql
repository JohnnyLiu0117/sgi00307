CREATE TABLE "GoogleConnection" (
  "id" TEXT NOT NULL DEFAULT 'owner',
  "subject" TEXT NOT NULL,
  "refreshTokenEncrypted" TEXT NOT NULL,
  "calendarId" TEXT NOT NULL DEFAULT '',
  "busyCalendarIds" TEXT[],
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GoogleConnection_pkey" PRIMARY KEY ("id")
);