import styles from "./PlatformShell.module.css";

const primary = [["/explore","Explore"],["/markets","Markets"],["/trading","Trade"],["/wallet","Wallet"],["/creator","Creator"],["/community","Community"],["/governance","Governance"],["/ai","AI"],["/more","More"]] as const;
const footer = [["Explore","/markets","Markets","/trading","Trading","/wallet","Wallet"],["Ecosystem","/creator","Creators","/community","Community","/ace-life","ACE Life"],["Account","/dashboard","Dashboard","/settings","Settings","/notifications","Notifications"],["Support","/help","Help Center","/security","Security","/status","Status"]] as const;

export default function PlatformShell({ children }: { children?: React.ReactNode }) {
  return <div className={styles.page}>
    <header className={styles.header}>
      <a href="/" className={styles.brand}><span className={styles.mark}>A</span><span>ACE<small>EXCHANGE</small></span></a>
      <nav className={styles.nav} aria-label="Platform navigation">{primary.map(([href,label])=><a href={href} key={href}>{label}</a>)}</nav>
      <div className={styles.actions}><a className={styles.ghost} href="/login">Sign in</a><a className={styles.button} href="/register">Create account</a><details className={styles.mobileMenu}><summary aria-label="Open platform menu">Menu</summary><nav aria-label="Mobile platform navigation">{primary.map(([href,label])=><a href={href} key={href}>{label}</a>)}<a href="/dashboard">Dashboard</a><a href="/help">Help Center</a><a href="/login">Sign in</a></nav></details></div>
    </header>
    {children}
    <footer className={styles.footer}><div className={styles.footerBrand}><strong>ACE EXCHANGE</strong><span>Trade. Create. Connect.</span></div><div className={styles.footerLinks}>{footer.map(([heading,...links])=><section key={heading}><strong>{heading}</strong>{Array.from({length:links.length/2},(_,i)=><a href={links[i*2]} key={links[i*2]}>{links[i*2+1]}</a>)}</section>)}</div><small>© 2026 ACE Exchange. Financial services remain unavailable until explicitly approved and provider-backed.</small></footer>
  </div>;
}
