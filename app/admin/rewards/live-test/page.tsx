import PlatformShell from "../../../PlatformShell";
import styles from "../../../PlatformShell.module.css";
import SettlementForm from "./SettlementForm";

export default function Page() {
  return <PlatformShell><main className={styles.main}><div className={styles.kicker}>ACE ADMIN / REWARDS</div><section className={styles.hero}><div><h1>Manual<br/><span>Settlement.</span></h1><p>Admin-only Base USDC settlement verification for the local real-value pilot.</p></div><aside className={styles.status}><div className={styles.statusRow}><span>Network</span><strong className={styles.ready}>Base 8453</strong></div><div className={styles.statusRow}><span>Asset</span><strong className={styles.ready}>USDC</strong></div><div className={styles.statusRow}><span>Maximum</span><strong className={styles.ready}>$5.00</strong></div></aside></section><section className={styles.section}><SettlementForm /></section></main></PlatformShell>;
}
