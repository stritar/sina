import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";

/**
 * The headless docs source: the loader gives us `getPage`, `getPages`,
 * `getPageTree`, and `generateParams` over the `content/docs` collection. We
 * render the result with our own CSS-Module chrome (no fumadocs-ui).
 */
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
