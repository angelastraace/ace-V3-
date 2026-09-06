import PlatformShell from "./PlatformShell";
import styles from "./PlatformShell.module.css";
export default function NotFound(){return <PlatformShell><main className={styles.main}><div className={styles.kicker}>ACE EXCHANGE / 404</div><section className={styles.hero}><div><h1>Page<br/><span>Not Found.</span></h1><p>The requested ACE Exchange route does not exist or is not available in this environment.</p><a className={styles.button} href="/">Return to ACE Exchange</a></div></section></main></PlatformShell>}
