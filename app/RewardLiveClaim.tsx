"use client";

import { useEffect, useState } from "react";
import styles from "./PlatformShell.module.css";

export default function RewardLiveClaim() {
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("1");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentClaim, setCurrentClaim] = useState<{ claimId?: string; amountUsd?: number; destinationWallet?: string; state?: string; settlementStatus?: string } | null>(null);

  useEffect(() => { fetch("/api/rewards/claim", { credentials: "include" }).then(response => response.json()).then(result => setCurrentClaim(result.claim || null)).catch(() => undefined); }, []);

  async function claim() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/rewards/claim", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, credentials: "include", body: JSON.stringify({ amountUsd: Number(amount), destinationWallet: wallet }) });
      const result = await response.json().catch(() => null);
      setMessage(response.ok ? `Reserved ${result.amountUsd} USDC. Claim ID: ${result.claimId}. Settlement is awaiting manual transfer.` : `Claim blocked: ${result?.reason || "request rejected"}`);
    } catch { setMessage("Claim service unavailable."); } finally { setBusy(false); }
  }

  return <section className={styles.section}><div className={styles.kicker}>LIVE TEST MODE</div><div className={styles.notice}>REAL FUNDS / BASE MAINNET / USDC / MAXIMUM PAYOUT $5 / MANUAL TREASURY SETTLEMENT</div><h2>Available reward: $1.00 / Claimable reward: $1.00</h2><p>Asset: USDC / Network: Base / Chain ID: 8453 / Minimum claim: $1 / Maximum claim: $5</p>{currentClaim && <div className={styles.notice}>Claim ID: {currentClaim.claimId} / Amount: {currentClaim.amountUsd?.toFixed(2)} USDC / Destination: {currentClaim.destinationWallet} / Status: {currentClaim.state} / Settlement: {currentClaim.settlementStatus}</div>}<div className={styles.form}><label>Amount (USD)<input className={styles.input} type="number" min="1" max="5" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label>Destination Base wallet<input className={styles.input} placeholder="0x..." value={wallet} onChange={(event) => setWallet(event.target.value)} required /></label><button className={styles.button} type="button" onClick={claim} disabled={busy}>{busy ? "Reserving..." : "CLAIM $1 USDC"}</button>{message && <div className={styles.notice} role="status">{message}</div>}</div></section>;
}
