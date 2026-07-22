import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const BASE = "https://sinahub.app";

// Static sitemap generated at build (no request-time work): the landing page
// plus every docs page.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [{ url: `${BASE}/` }];

  for (const page of source.getPages()) {
    entries.push({ url: `${BASE}${page.url}` });
  }

  return entries;
}
