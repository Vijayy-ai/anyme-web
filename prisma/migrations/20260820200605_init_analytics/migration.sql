-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "referrer" TEXT,
    "seriesId" TEXT,
    "seriesTitle" TEXT,
    "episodeId" TEXT,
    "episodeNumber" INTEGER,
    "label" TEXT,
    "sessionId" TEXT,
    "visitorId" TEXT,
    "ip" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "meta" TEXT
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_seriesId_idx" ON "AnalyticsEvent"("seriesId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_countryCode_idx" ON "AnalyticsEvent"("countryCode");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorId_idx" ON "AnalyticsEvent"("visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");
