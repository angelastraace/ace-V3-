import PlatformShell from "./PlatformShell";
import styles from "./PlatformShell.module.css";

type Card = [string,string];
type Link = [string,string,string];
export default function FeaturePage({ kicker, title, accent, intro, status, cards, links=[], notice }: {
  kicker:string; title:string; accent:string; intro:string; status:[string,string,"ready"|"partial"|"blocked"][]; cards:Card[]; links?:Link[]; notice?:string;
}) {
  return <PlatformShell><main className={styles.main}>
    <div className={styles.kicker}>{kicker}</div>
    <section className={styles.hero}><div><h1>{title}<br/><span>{accent}</span></h1><p>{intro}</p>{notice&&<div className={styles.notice}>{notice}</div>}</div>
      <aside className={styles.status}>{status.map(([a,b,s])=><div className={styles.statusRow} key={a}><span>{a}</span><strong className={styles[s]}>{b}</strong></div>)}</aside>
    </section>
    <section className={styles.section}><div className={styles.kicker}>PRODUCT CAPABILITIES</div><h2>Designed as one connected ACE system.</h2><div className={styles.grid}>{cards.map(([h,p],i)=><article className={styles.card} key={h}><small>0{i+1}</small><h3>{h}</h3><p>{p}</p></article>)}</div></section>
    {links.length>0&&<section className={styles.section}><div className={styles.kicker}>OPEN WORKSPACE</div><h2>Continue into the platform.</h2><div className={styles.links}>{links.map(([href,label,sub])=><a className={styles.linkCard} href={href} key={href}><strong>{label} ↗</strong><span>{sub}</span></a>)}</div></section>}
  </main></PlatformShell>;
}
