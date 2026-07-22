/**
 * The insight-card constitution — an UNGOVERNED display pattern.
 *
 * A single advisory insight for display: a tone, a title, a body, and an
 * optional labelled metric. Shape-only; `.strict()`; no policy, no escalation —
 * it moves no money. Mounts the presentational `InsightCard`.
 */

import { z } from "zod";

export const insightPayload = z
  .object({
    id: z.string().min(1).max(40),
    tone: z.enum(["info", "positive", "caution"]),
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(400),
    metricLabel: z.string().min(1).max(40).optional(),
    metricValue: z.string().min(1).max(40).optional(),
  })
  .strict();

export type InsightCardPayload = z.infer<typeof insightPayload>;

export const INSIGHT_VERSION = "1.0.0";
