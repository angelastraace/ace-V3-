import PlatformShell from "../../PlatformShell";
import RewardClaimSimulator from "../../RewardClaimSimulator";
import RewardLiveClaim from "../../RewardLiveClaim";
import styles from "../../PlatformShell.module.css";

export default function Page() {
  const live = process.env.ACE_REWARD_EXECUTION_MODE === "manual-live-test";
  return <PlatformShell><main className={styles.main}><div className={styles.kicker}>ACE CARD / REWARDS</div><section className={styles.hero}><div><h1>ACE<br/><span>Rewards.</span></h1><p>{live ? "Local real-value pilot. Funds move only through manual treasury transfer and on-chain verification." : "Simulation-only reward accounting. Displayed rewards are liabilities backed by approved funding; no target-token inventory or payout is implied."}</p></div><aside className={styles.status}><div className={styles.statusRow}><span>Execution mode</span><strong className={styles.ready}>{live ? "Manual live test" : "Simulation"}</strong></div><div className={styles.statusRow}><span>Network</span><strong className={styles.ready}>{live ? "Base 8453" : "Not applicable"}</strong></div><div className={styles.statusRow}><span>Payouts</span><strong className={live ? styles.ready : styles.blocked}>{live ? "Manual only" : "Disabled"}</strong></div></aside></section>{live ? <RewardLiveClaim /> : <RewardClaimSimulator />}</main></PlatformShell>;
}
