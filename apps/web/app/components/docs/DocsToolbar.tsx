import Link from "next/link";
import { getBreadcrumbItems } from "fumadocs-core/breadcrumb";
import { findNeighbour } from "fumadocs-core/server";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { source } from "@/lib/source";
import { messages } from "./messages";
import { CopyPageMenu } from "./CopyPageMenu";
import styles from "./DocsToolbar.module.css";

/**
 * The page toolbar above the `<h1>`: breadcrumb on the left, the Copy Page split
 * menu + prev/next arrows on the right. Both halves are derived from the same
 * page tree the sidebar renders, so nav order is defined once (in `meta.json`).
 * Server component — only `CopyPageMenu` crosses to the client.
 */
export function DocsToolbar({ url }: { url: string }) {
  const tree = source.getPageTree();
  const crumbs = getBreadcrumbItems(url, tree, {
    includeRoot: { url: "/docs" },
    includePage: true,
  });
  const { previous, next } = findNeighbour(tree, url);

  // Raw markdown is pre-generated as a static asset by scripts/generate-llms.mjs.
  const markdownUrl = url === "/docs" ? "/llms/docs/index.md" : `/llms${url}.md`;

  return (
    <div className={styles.toolbar}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol className={styles.crumbs}>
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={`${crumb.url ?? "crumb"}-${i}`} className={styles.crumb}>
                {crumb.url && !last ? (
                  <Link href={crumb.url} className={styles.crumbLink}>
                    {crumb.name}
                  </Link>
                ) : (
                  <span className={styles.crumbCurrent} aria-current={last ? "page" : undefined}>
                    {crumb.name}
                  </span>
                )}
                {last ? null : (
                  <span className={styles.crumbSeparator} aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className={styles.actions}>
        <CopyPageMenu markdownUrl={markdownUrl} />
        <div className={styles.arrows}>
          {previous ? (
            <Link
              href={previous.url}
              className={styles.arrow}
              aria-label={`${messages.pager.previous}: ${previous.name}`}
            >
              <CaretLeft aria-hidden weight="bold" className={styles.arrowIcon} />
            </Link>
          ) : (
            <span className={styles.arrowDisabled} aria-hidden="true">
              <CaretLeft weight="bold" className={styles.arrowIcon} />
            </span>
          )}
          {next ? (
            <Link
              href={next.url}
              className={styles.arrow}
              aria-label={`${messages.pager.next}: ${next.name}`}
            >
              <CaretRight aria-hidden weight="bold" className={styles.arrowIcon} />
            </Link>
          ) : (
            <span className={styles.arrowDisabled} aria-hidden="true">
              <CaretRight weight="bold" className={styles.arrowIcon} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
