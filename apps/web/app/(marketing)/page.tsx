import Link from "next/link";
import { ThemeToggle } from "../components/docs/ThemeToggle";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <div className={styles.themeSlot}>
        <ThemeToggle />
      </div>
      <h1 className={styles.title}>SINA</h1>
      <p className={styles.tagline}>
        The governed design system for AI agents. The model emits intent — SINA
        decides what renders.
      </p>
      <Link className={styles.cta} href="/docs">
        Read the docs →
      </Link>
    </main>
  );
}
