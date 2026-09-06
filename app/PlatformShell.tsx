import styles from "./PlatformShell.module.css";

export default function PlatformShell({ children }: { children?: React.ReactNode }) {
  return <div className={styles.page}>
    <header className={styles.header}>
      <a href="/" className={styles.brand}><span className={styles.mark}>A</span><span>ACE<small>EXCHANGE</small></span></a>
      <nav className={styles.nav} aria-label="Platform navigation">
        <a href="/markets">Markets</a><a href="/trading">Trade</a><a href="/wallet">Wallet</a><a href="/card">ACE Card</a><a href="/creator">Creator</a><a href="/community">Community</a><a href="/governance">Governance</a><a href="/ai">AI</a><a href="/more">More</a>
      </nav>
      <div className={styles.actions}><a className={styles.ghost} href="/login">Sign in</a><a className={styles.button} href="/register">Create account</a></div>
    </header>
    {children}
    <footer className={styles.footer}><span>© 2026 ACE Exchange</span><span>Trade. Create. Connect.</span></footer>
  </div>;
}
