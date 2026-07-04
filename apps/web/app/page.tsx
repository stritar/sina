import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>SINA</h1>
      <p className={styles.tagline}>
        Marketing shell — scaffold only. Landing layouts land next.
      </p>
    </main>
  );
}
