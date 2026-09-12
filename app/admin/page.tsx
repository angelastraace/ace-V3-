import PlatformShell from "../PlatformShell";
import styles from "../PlatformShell.module.css";

const dashboards = [
  {
    name: "Launch Readiness",
    href: "/admin/launch-readiness",
    summary: "Go / no-go controls, config gates, and operational release readiness.",
    state: "ready"
  },
  {
    name: "Liquidity Router",
    href: "/admin/liquidity-router",
    summary: "ACE reward liability vs external DEX execution liquidity, route checks, and fail-closed controls.",
    state: "ready"
  },
  {
    name: "Reward Funding",
    href: "/admin/rewards/funding",
    summary: "Approved backing, sponsor sources, reward liabilities, and reconciliation coverage.",
    state: "ready"
  }
] as const;

export default function Page() {
  return (
    <PlatformShell>
      <main className={styles.main}>
        <div className={styles.kicker}>ACE ADMIN / OPERATIONS</div>

        <section className={styles.hero}>
          <div>
            <h1>
              Executive
              <br />
              <span>Control Center.</span>
            </h1>
            <p>
              Three core admin dashboards govern launch safety, external liquidity execution,
              and reward funding coverage before any user-facing claim is approved.
            </p>
          </div>

          <aside className={styles.status}>
            <div className={styles.statusRow}>
              <span>Access model</span>
              <strong className={styles.blocked}>Server-side RBAC required</strong>
            </div>
            <div className={styles.statusRow}>
              <span>Active dashboards</span>
              <strong>3</strong>
            </div>
            <div className={styles.statusRow}>
              <span>Execution mode</span>
              <strong className={styles.ready}>Simulation-safe</strong>
            </div>
          </aside>
        </section>

        <section className={styles.section}>
          <div className={styles.grid}>
            {dashboards.map((dashboard) => (
              <article className={styles.card} key={dashboard.name}>
                <small>{dashboard.name}</small>
                <h3>{dashboard.state === "ready" ? "READY" : "BLOCKED"}</h3>
                <p>{dashboard.summary}</p>
                <a className={styles.button} href={dashboard.href}>
                  Open dashboard
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PlatformShell>
  );
}

