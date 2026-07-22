/**
 * The activity-feed constitution — an UNGOVERNED display pattern.
 *
 * A timeline of recent account events — a pure read: each entry has a `kind`, a
 * timestamp, a title, and optional detail. Shape-only; `.strict()` per entry,
 * bounded. No money, no masked fields. Mounts the presentational `ActivityFeed`.
 */

import { z } from "zod";

const activityItem = z
  .object({
    id: z.string().min(1).max(40),
    at: z.string().datetime(),
    kind: z.enum(["login", "payment", "transfer", "alert", "statement", "card"]),
    title: z.string().min(1).max(120),
    detail: z.string().min(1).max(280).optional(),
  })
  .strict();

export const activityFeedPayload = z
  .object({
    items: z.array(activityItem).max(100, "too many items (max 100)"),
  })
  .strict();

export type ActivityFeedPayload = z.infer<typeof activityFeedPayload>;

export const ACTIVITY_FEED_VERSION = "1.0.0";
