/**
 * The alerts-feed constitution — an UNGOVERNED display pattern.
 *
 * A time-ordered feed of account alerts (info / warning / critical) — a pure
 * read. Shape-only; bounded; carries no policy, no escalation, no masked fields.
 * Mounts the presentational `AlertsFeed`.
 */

import { z } from "zod";

const alert = z
  .object({
    id: z.string().min(1).max(40),
    at: z.string().datetime(),
    severity: z.enum(["info", "warning", "critical"]),
    title: z.string().min(1).max(120),
    body: z.string().min(1).max(280).optional(),
  })
  .strict();

export const alertsFeedPayload = z
  .object({
    alerts: z.array(alert).max(100, "too many alerts (max 100)"),
  })
  .strict();

export type AlertsFeedPayload = z.infer<typeof alertsFeedPayload>;

export const ALERTS_FEED_VERSION = "1.0.0";
