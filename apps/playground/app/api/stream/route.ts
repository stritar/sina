/**
 * ⚠️ PHASE 0 CLOUDFLARE SPIKE — THROWAWAY. ⚠️
 *
 * This route exists only to de-risk one question early: does Next 15 App Router's
 * edge runtime stream a ReadableStream incrementally on Cloudflare's workerd?
 * It wires NO model and makes NO API call — `ai@4` streaming (Phase 4) is HTTP/RSC
 * transport over this same edge runtime, provider-independent.
 *
 * Supersede or delete this when the real streamUI harness lands in Phase 4.
 *
 * Verify (from apps/playground):
 *   pnpm dlx @cloudflare/next-on-pages@1
 *   pnpm dlx wrangler@3 pages dev .vercel/output/static \
 *     --compatibility-date=2024-09-23 --compatibility-flags=nodejs_compat
 *   curl -N http://localhost:8788/api/stream   # 5 lines must arrive ~200ms apart, not all at once
 *
 * Phase 0 spike findings (2026-06-26, confirmed PASS — chunks arrived ~200ms apart):
 *   1. `nodejs_compat` flag is REQUIRED — Next's edge adapter imports node:buffer /
 *      node:async_hooks; without it the worker returns an error page, not the stream.
 *      Phase 7 must set this in the deploy config (wrangler.toml / Pages settings).
 *   2. The Vercel build wrapper runs its own `pnpm install`, which fails on unapproved
 *      build scripts unless `allowBuilds` (pnpm-workspace.yaml) lists esbuild + sharp.
 */

export const runtime = "edge";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 1; i <= 5; i++) {
        controller.enqueue(encoder.encode(`chunk ${i}\n`));
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
