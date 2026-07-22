import { FINTECH_STANDARDS } from "@sina-design-system/fintech/standards";
import type { Standard, StandardTier } from "@sina-design-system/governance";

import styles from "./StandardsTable.module.css";

/**
 * The standards catalog for one industry, rendered from the constitution package
 * itself — never hand-maintained prose. A bidirectional vitest guard
 * (`packages/<industry>/src/standards.test.ts`) fails the build if a rule cites a
 * standard missing from the catalog, or an entry cites nothing the code checks, so
 * this table cannot drift from the schemas or overstate what SINA enforces.
 *
 * A new industry registers its catalog here and adds a `## <Industry>` section to
 * `content/docs/governance/standards.mdx` — never a new page (the 20-page budget).
 * Recipe: /new-industry-standards.
 */
const CATALOGS: Record<string, Standard[]> = {
  fintech: FINTECH_STANDARDS,
};

const TIERS: Array<{ tier: StandardTier; heading: string; blurb: string }> = [
  {
    tier: "format",
    heading: "Format & structure",
    blurb: "Checksums and code lists. Deterministic: a payload either satisfies them or it doesn't.",
  },
  {
    tier: "regulatory",
    heading: "Regulatory",
    blurb: "Real regulations. These are not yours to loosen casually.",
  },
  {
    tier: "policy",
    heading: "SINA policy",
    blurb: "Tunable product defaults, not law. Set these to your own risk appetite.",
  },
];

export function StandardsTable({ industry }: { industry: string }) {
  const catalog = CATALOGS[industry];
  if (!catalog) return null;

  return (
    <div className={styles.root}>
      {TIERS.map(({ tier, heading, blurb }) => {
        const rows = catalog.filter((entry) => entry.tier === tier);
        if (rows.length === 0) return null;

        return (
          <section key={tier} className={styles.tier}>
            <h3 className={styles.heading}>{heading}</h3>
            <p className={styles.blurb}>{blurb}</p>
            <div className={styles.wrap}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Standard</th>
                    <th scope="col">What SINA actually checks</th>
                    <th scope="col">Where</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry) => (
                    <tr key={entry.id}>
                      <th scope="row" className={styles.standard}>
                        {entry.url ? (
                          <a href={entry.url} target="_blank" rel="noreferrer">
                            {entry.name}
                          </a>
                        ) : (
                          entry.name
                        )}
                        <span className={styles.meta}>
                          {entry.title} · {entry.authority}
                        </span>
                      </th>
                      <td>{entry.enforcement}</td>
                      <td>
                        <ul className={styles.where}>
                          {entry.where.map((place) => (
                            <li key={place}>
                              <code>{place}</code>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
