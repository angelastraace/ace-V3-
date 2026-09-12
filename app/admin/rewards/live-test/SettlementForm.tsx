"use client";

import { useEffect, useState } from "react";
import styles from "../../../PlatformShell.module.css";

export default function SettlementForm() {
  const [clientUserId, setClientUserId] = useState("");
  const [claimId, setClaimId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [claims, setClaims] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => { fetch("/api/admin/rewards/live-test", { credentials: "include" }).then(response => response.json()).then(result => setClaims(result.claims || [])).catch(() => undefined); }, []);
  async function provision() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/rewards/live-test/provision", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, credentials: "include", body: JSON.stringify({ clientUserId }) });
      const result = await response.json().catch(() => null);
      setMessage(response.ok ? `Provisioned $5 backing and $1 accrual: ${result.accrualId}.` : `Provisioning blocked: ${result?.reason || "request rejected"}`);
    } catch { setMessage("Provisioning service unavailable."); } finally { setBusy(false); }
  }
  async function submit() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/rewards/live-test", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ claimId, txHash }) });
      const result = await response.json().catch(() => null);
      setMessage(response.ok ? `Settled claim ${result.claimId}.` : `Settlement blocked: ${result?.reason || "request rejected"}`);
    } catch { setMessage("Settlement service unavailable."); } finally { setBusy(false); }
  }
  return <div className={styles.form}><div className={styles.kicker}>LOCAL TEST CONTROL</div><p>Backing: $5.00 / Liability: $1.00 / Asset: USDC / Network: Base / Chain ID: 8453</p><label>Client user ID<input className={styles.input} value={clientUserId} onChange={(event) => setClientUserId(event.target.value)} /></label><button className={styles.button} onClick={provision} disabled={busy}>Create $5 backing and $1 accrual</button>{claims.map(claim => <div className={styles.notice} key={String(claim.claimId)}>Claim ID: {String(claim.claimId)} / User: {String(claim.userId)} / Amount: {String(claim.amountUsd)} USDC / Network: Base / Destination: {String(claim.destinationWallet)} / Status: {String(claim.state)} / Settlement: {String(claim.settlementStatus)}</div>)}<div className={styles.kicker}>VERIFY PAYMENT</div><p>Send USDC externally on Base, then enter the transaction hash. ACE never stores treasury keys or submits transfers.</p><label>Claim ID<input className={styles.input} value={claimId} onChange={(event) => setClaimId(event.target.value)} /></label><label>Base transaction hash<input className={styles.input} value={txHash} onChange={(event) => setTxHash(event.target.value)} /></label><button className={styles.button} onClick={submit} disabled={busy}>VERIFY PAYMENT</button>{message && <div className={styles.notice} role="status">{message}</div>}</div>;
}
