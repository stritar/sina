import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { DocsShell } from "@/app/components/docs/DocsShell";

/**
 * Docs segment layout — wraps every `/docs` page in the SINA-styled shell
 * (header + sidebar from the fumadocs page tree). Headless: no fumadocs-ui.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell tree={source.pageTree}>{children}</DocsShell>;
}
