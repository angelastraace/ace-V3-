import PlatformShell from "../../PlatformShell";
import styles from "../../PlatformShell.module.css";
import { providerSnapshot, safetyAssertion } from "../../../lib/liquidity-readonly";
import { aceGlobalLiquidityArchitecture, simulator } from "../../../lib/liquidity-router";

export const dynamic = "force-dynamic";

export default function Page() {
  const s = simulator();
  const providers = providerSnapshot();
  const safety = safetyAssertion();
  const architecture = aceGlobalLiquidityArchitecture();

  return (
    <PlatformShell>
      <main className={styles.main}>
        <div className={styles.kicker}>ACE ADMIN / GLOBAL LIQUIDITY ARCHITECTURE</div>

        <section className={styles.hero}>
          <div>
            <h1>
              ACE Global
              <br />
              <span>Liquidity Router.</span>
            </h1>
            <p>
              ACE owns the reward liability and backing. External liquidity pools provide
              execution liquidity at claim time; they do not replace ACE's economic
              obligation.
            </p>
          </div>

          <aside className={styles.status}>
            <div className={styles.statusRow}>
              <span>Execution model</span>
              <strong className={styles.ready}>{architecture.executionModel}</strong>
            </div>
            <div className={styles.statusRow}>
              <span>Approved backing</span>
              <strong>${s.funding.backing.toLocaleString()}</strong>
            </div>
            <div className={styles.statusRow}>
              <span>Safety assertion</span>
              <strong className={safety.passed ? styles.ready : styles.blocked}>
                {safety.passed ? "PASSED" : "FAILED"}
              </strong>
            </div>
          </aside>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>TWO SEPARATE ENGINES</div>
          <div className={styles.grid}>
            {[architecture.rewardFundingEngine, architecture.rewardLiability, architecture.liquidityRoutingEngine].map((engine) => (
              <article className={styles.card} key={engine.name}>
                <small>{engine.name}</small>
                <h3>{engine.role}</h3>
                <p>{engine.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>CONNECTED EXTERNAL POOLS</div>
          <div className={styles.grid}>
            {architecture.connectedPools.map((pool) => (
              <article className={styles.card} key={pool.provider}>
                <small>{pool.provider}</small>
                <h3>{pool.status}</h3>
                <p>
                  {pool.route}
                  <br />
                  {pool.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>FAIL-CLOSED RULE</div>
          <div className={styles.notice}>{architecture.failClosedRule}</div>
        </section>

        <section className={styles.section}>
          <div className={styles.kicker}>LIVE READ-ONLY PROVIDERS</div>
          <div className={styles.grid}>
            {providers.map((p) => (
              <article className={styles.card} key={p.provider}>
                <small>ETHEREUM MAINNET</small>
                <h3>{p.provider}</h3>
                <p>
                  STATUS: {p.status}
                  <br />
                  CHAIN: {p.chainId}
                  <br />
                  PAIRS: {p.supportedPairs.join(", ") || "Configuration required"}
                  <br />
                  LAST SUCCESS: {p.lastSuccess || "—"}
                  <br />
                  MODE: {p.mode}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PlatformShell>
  );
}
