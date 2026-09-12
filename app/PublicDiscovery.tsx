"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./PlatformShell.module.css";

type Entity = { title: string; detail: string; href: string; group: "Markets" | "Creators" | "Communities" | "Help" | "Platform" };

const index: Entity[] = [
  { title: "Markets", detail: "Live public market discovery", href: "/markets", group: "Markets" },
  { title: "BTC / USD", detail: "Read-only Bitcoin pair workspace", href: "/trade/BTC-USD", group: "Markets" },
  { title: "ETH / USD", detail: "Read-only Ethereum pair workspace", href: "/trade/ETH-USD", group: "Markets" },
  { title: "SOL / USD", detail: "Read-only Solana pair workspace", href: "/trade/SOL-USD", group: "Markets" },
  { title: "Creator Hub", detail: "Creator tools and public ecosystem information", href: "/creator", group: "Creators" },
  { title: "Community", detail: "Public community discovery", href: "/community", group: "Communities" },
  { title: "Help Center", detail: "Product, account, trading, and security guidance", href: "/help", group: "Help" },
  { title: "Security", detail: "Account protection and security information", href: "/security", group: "Help" },
  { title: "Fees", detail: "Fee information and availability notices", href: "/fees", group: "Help" },
  { title: "System status", detail: "ACE platform health and readiness", href: "/status", group: "Platform" },
  { title: "Developers", detail: "Public developer and API information", href: "/developers", group: "Platform" },
  { title: "Legal", detail: "Terms, privacy, risk, and compliance information", href: "/terms", group: "Platform" },
];

const groups = ["Markets", "Creators", "Communities", "Help", "Platform"] as const;

export function PublicSearch() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem("ace-search-history") || "[]")); } catch {} }, []);
  const results = useMemo(() => index.filter(item => `${item.title} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase())), [query]);
  const save = (item: Entity) => { const next = [item.title, ...recent.filter(value => value !== item.title)].slice(0, 5); setRecent(next); localStorage.setItem("ace-search-history", JSON.stringify(next)); window.location.assign(item.href); };
  const key = (event: React.KeyboardEvent<HTMLInputElement>) => { if (!results.length) return; if (event.key === "ArrowDown") { event.preventDefault(); setSelected(value => Math.min(value + 1, results.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setSelected(value => Math.max(value - 1, 0)); } if (event.key === "Enter") { event.preventDefault(); save(results[selected] || results[0]); } if (event.key === "Escape") setQuery(""); };
  return <section className={styles.discovery} aria-label="Public ACE search"><label htmlFor="global-search">Search ACE Exchange public content</label><input id="global-search" className={styles.input} value={query} onChange={event => { setQuery(event.target.value); setSelected(0); }} onKeyDown={key} placeholder="Search markets, creators, communities, or help" type="search" autoComplete="off" />
    {query ? <div className={styles.resultList} role="listbox" aria-label="Search results">{results.length ? groups.map(group => { const entries = results.filter(item => item.group === group); return entries.length ? <section key={group}><small>{group}</small>{entries.map(item => <button type="button" className={styles.result} key={item.href} onClick={() => save(item)}><strong>{item.title}</strong><span>{item.detail}</span></button>)}</section> : null; }) : <div className={styles.notice} role="status">No public results for “{query}”. Try a market, Help Center, or Security.</div>}</div> : recent.length ? <div className={styles.recent}><span>Recent searches</span>{recent.map(title => { const item = index.find(entry => entry.title === title); return item ? <button type="button" key={title} onClick={() => save(item)}>{title}</button> : null; })}<button type="button" onClick={() => { localStorage.removeItem("ace-search-history"); setRecent([]); }}>Clear history</button></div> : <p className={styles.muted}>Only public product content is indexed. Account and financial data are excluded.</p>}</section>;
}

export function DiscoveryHub() {
  return <section className={styles.discovery} aria-label="ACE discovery"><PublicSearch /><div className={styles.discoveryGrid}>{groups.map(group => <article className={styles.card} key={group}><small>{group.toUpperCase()}</small><h3>{group}</h3>{index.filter(item => item.group === group).slice(0, 3).map(item => <a className={styles.inlineLink} key={item.href} href={item.href}>{item.title}<span>{item.detail}</span></a>)}</article>)}</div></section>;
}
