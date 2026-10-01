-- AlterTable
ALTER TABLE "GoogleConnection" ADD COLUMN     "scopes" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Quote" (
    "id" UUID NOT NULL,
    "inquiryId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "speakerFee" DECIMAL(12,2) NOT NULL,
    "travelFee" DECIMAL(12,2) NOT NULL,
    "otherFee" DECIMAL(12,2) NOT NULL,
    "terms" TEXT NOT NULL,
    "recording" TEXT NOT NULL,
    "validUntil" TIMESTAMPTZ(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "acceptedName" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizerPortal" (
    "id" UUID NOT NULL,
    "inquiryId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenEncrypted" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "organizerNotes" TEXT NOT NULL DEFAULT '',
    "confirmedAt" TIMESTAMP(3),
    "materials" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "OrganizerPortal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "portalId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "takeaway" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "publishConsent" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreparationTask" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "dueAt" TIMESTAMPTZ(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PreparationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailDraft" (
    "id" UUID NOT NULL,
    "inquiryId" UUID,
    "dedupeKey" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "providerId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "MailDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_inquiryId_version_key" ON "Quote"("inquiryId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizerPortal_inquiryId_key" ON "OrganizerPortal"("inquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizerPortal_tokenHash_key" ON "OrganizerPortal"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_portalId_key" ON "Feedback"("portalId");

-- CreateIndex
CREATE INDEX "PreparationTask_completed_dueAt_idx" ON "PreparationTask"("completed", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "MailDraft_dedupeKey_key" ON "MailDraft"("dedupeKey");

-- CreateIndex
CREATE INDEX "MailDraft_status_createdAt_idx" ON "MailDraft"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizerPortal" ADD CONSTRAINT "OrganizerPortal_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "OrganizerPortal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreparationTask" ADD CONSTRAINT "PreparationTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SpeakingEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailDraft" ADD CONSTRAINT "MailDraft_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;