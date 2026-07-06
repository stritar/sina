"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Root, Node } from "fumadocs-core/page-tree";
import styles from "./Sidebar.module.css";

/**
 * Renders the fumadocs page tree (`source.pageTree`) as an accessible nav.
 * Client-only for `usePathname()` active state; used both in the desktop column
 * and inside the mobile Dialog drawer.
 */
export function Sidebar({ tree }: { tree: Root }) {
  const pathname = usePathname();
  return (
    <ul className={styles.list}>
      {tree.children.map((node, i) => (
        <TreeNode key={i} node={node} pathname={pathname} />
      ))}
    </ul>
  );
}

function TreeNode({ node, pathname }: { node: Node; pathname: string }) {
  if (node.type === "separator") {
    return (
      <li className={styles.separator} role="presentation">
        {node.name}
      </li>
    );
  }

  if (node.type === "folder") {
    return (
      <li>
        {node.index ? (
          <TreeLink url={node.index.url} name={node.index.name} pathname={pathname} />
        ) : (
          <span className={styles.folderLabel}>{node.name}</span>
        )}
        <ul className={styles.list}>
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} pathname={pathname} />
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li>
      <TreeLink url={node.url} name={node.name} pathname={pathname} external={node.external} />
    </li>
  );
}

function TreeLink({
  url,
  name,
  pathname,
  external,
}: {
  url: string;
  name: ReactNode;
  pathname: string;
  external?: boolean;
}) {
  const active = pathname === url;
  return (
    <Link
      href={url}
      className={styles.link}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {name}
    </Link>
  );
}
