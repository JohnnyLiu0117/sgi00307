-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "googleSubject" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicFamily" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TopicFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "outcomes" TEXT[],
    "caveat" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicOffering" (
    "id" UUID NOT NULL,
    "topicId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "minMinutes" INTEGER,
    "maxMinutes" INTEGER,

    CONSTRAINT "TopicOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicVersion" (
    "id" UUID NOT NULL,
    "topicId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "outline" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTopic" (
    "articleId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "ArticleTopic_pkey" PRIMARY KEY ("articleId","topicId")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" UUID NOT NULL,
    "receipt" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "attendees" INTEGER NOT NULL,
    "topicId" TEXT,
    "customTopic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inquiry',
    "sourceChannel" TEXT NOT NULL DEFAULT 'web',
    "sourceSubmissionId" TEXT,
    "consentVersion" TEXT NOT NULL DEFAULT '2026-09-v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryRequirements" (
    "id" UUID NOT NULL,
    "inquiryId" UUID NOT NULL,
    "audiences" TEXT[],
    "ageRange" TEXT,
    "problems" TEXT NOT NULL,
    "takeaways" TEXT NOT NULL,
    "interaction" BOOLEAN NOT NULL,
    "workshop" BOOLEAN NOT NULL,
    "worksheet" BOOLEAN NOT NULL,
    "customContent" BOOLEAN NOT NULL,
    "equipment" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "InquiryRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attribution" (
    "id" UUID NOT NULL,
    "inquiryId" UUID NOT NULL,
    "discovery" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "articleId" TEXT,

    CONSTRAINT "Attribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingEvent" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "inquiryId" UUID,
    "organizationId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "topicVersionId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Taipei',
    "venue" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "attendees" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "fee" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "requirements" JSONB NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "confirmedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SpeakingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarBlock" (
    "id" UUID NOT NULL,
    "eventId" UUID,
    "sourceKey" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CalendarBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL,
    "lastSuccessAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxJob" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseUntil" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboxJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleSubject_key" ON "User"("googleSubject");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TopicOffering_topicId_label_key" ON "TopicOffering"("topicId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "TopicVersion_topicId_version_key" ON "TopicVersion"("topicId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_receipt_key" ON "Inquiry"("receipt");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_idempotencyKey_key" ON "Inquiry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_sourceChannel_sourceSubmissionId_key" ON "Inquiry"("sourceChannel", "sourceSubmissionId");

-- CreateIndex
CREATE UNIQUE INDEX "InquiryRequirements_inquiryId_key" ON "InquiryRequirements"("inquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Attribution_inquiryId_key" ON "Attribution"("inquiryId");

-- CreateIndex
CREATE INDEX "Attribution_articleId_idx" ON "Attribution"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakingEvent_code_key" ON "SpeakingEvent"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakingEvent_inquiryId_key" ON "SpeakingEvent"("inquiryId");

-- CreateIndex
CREATE INDEX "SpeakingEvent_status_startsAt_idx" ON "SpeakingEvent"("status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_eventId_code_key" ON "ChecklistItem"("eventId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarBlock_sourceKey_key" ON "CalendarBlock"("sourceKey");

-- CreateIndex
CREATE INDEX "CalendarBlock_startsAt_endsAt_idx" ON "CalendarBlock"("startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "OutboxJob_dedupeKey_key" ON "OutboxJob"("dedupeKey");

-- CreateIndex
CREATE INDEX "OutboxJob_status_nextAttemptAt_idx" ON "OutboxJob"("status", "nextAttemptAt");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "TopicFamily"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicOffering" ADD CONSTRAINT "TopicOffering_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicVersion" ADD CONSTRAINT "TopicVersion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTopic" ADD CONSTRAINT "ArticleTopic_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTopic" ADD CONSTRAINT "ArticleTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryRequirements" ADD CONSTRAINT "InquiryRequirements_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribution" ADD CONSTRAINT "Attribution_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribution" ADD CONSTRAINT "Attribution_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingEvent" ADD CONSTRAINT "SpeakingEvent_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingEvent" ADD CONSTRAINT "SpeakingEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingEvent" ADD CONSTRAINT "SpeakingEvent_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingEvent" ADD CONSTRAINT "SpeakingEvent_topicVersionId_fkey" FOREIGN KEY ("topicVersionId") REFERENCES "TopicVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SpeakingEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarBlock" ADD CONSTRAINT "CalendarBlock_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SpeakingEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;