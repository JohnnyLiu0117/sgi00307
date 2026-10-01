ALTER TABLE "Inquiry" ADD CONSTRAINT "inquiry_positive" CHECK ("durationMinutes" BETWEEN 30 AND 720 AND "attendees" BETWEEN 1 AND 10000);
ALTER TABLE "Inquiry" ADD CONSTRAINT "inquiry_status" CHECK ("status" IN ('inquiry','contacted','negotiating','awaiting_confirmation','converted','declined','cancelled'));
ALTER TABLE "TopicOffering" ADD CONSTRAINT "offering_range" CHECK (("minMinutes" IS NULL AND "maxMinutes" IS NULL) OR ("minMinutes" IS NOT NULL AND "maxMinutes" IS NOT NULL AND "minMinutes">0 AND "maxMinutes">="minMinutes"));
ALTER TABLE "TopicVersion" ADD CONSTRAINT "version_duration" CHECK ("durationMinutes">0 AND "version">0);
ALTER TABLE "SpeakingEvent" ADD CONSTRAINT "event_time" CHECK ("endsAt">"startsAt" AND "durationMinutes">0 AND "attendees">0 AND ("fee" IS NULL OR "fee">=0));
ALTER TABLE "SpeakingEvent" ADD CONSTRAINT "event_status" CHECK ("status" IN ('confirmed','preparing','completed','cancelled'));
ALTER TABLE "CalendarBlock" ADD CONSTRAINT "block_time" CHECK ("endsAt">"startsAt");