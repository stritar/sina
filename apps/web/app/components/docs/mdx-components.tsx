import type { MDXComponents } from "mdx/types";
import type { AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { GovernanceDemo } from "@sina-design-system/governance-demo";
import { CodePre } from "./CodePre";
import * as visuals from "./visuals";

/**
 * MDX element → SINA renderer map for the headless docs. Prose typography is
 * handled by the `.prose` class on the article; here we override only where we
 * need behavior: code blocks (copy button) and links (internal `next/link` vs
 * external). Custom MDX components (e.g. `<GovernanceDemo>`, the visual kit) are
 * merged here and via the `extra` argument at call sites.
 */
export function getMDXComponents(extra?: MDXComponents): MDXComponents {
  return {
    // The reusable docs visual kit (Callout, Steps, Card, Tabs, diagrams, …).
    ...visuals,
    // Custom MDX components usable directly in `.mdx` content. Per-primitive
    // live demos are NOT registered here — each primitives/*.mdx imports its
    // own demo module directly, so demo code stays code-split per page.
    GovernanceDemo,
    pre: (props) => <CodePre {...props} />,
    a: ({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const isExternal = /^https?:\/\//.test(href) || href.startsWith("//");
      if (isExternal) {
        return (
          <a href={href} target="_blank" rel="noreferrer" {...rest}>
            {children}
          </a>
        );
      }
      return (
        <Link href={href} {...rest}>
          {children}
        </Link>
      );
    },
    ...extra,
  };
}
