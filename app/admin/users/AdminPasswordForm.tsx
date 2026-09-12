"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import styles from "../../PlatformShell.module.css";

export default function AdminPasswordForm() {
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/users/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, newPassword }),
      });
      setMessage(response.ok ? "Password updated successfully." : "Password update failed.");
      if (response.ok) setNewPassword("");
    } catch {
      setMessage("Password update failed.");
    } finally {
      setBusy(false);
    }
  }

  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.kicker}>SET USER PASSWORD</div>
    <label>User ID<input className={styles.input} value={userId} onChange={(event) => setUserId(event.target.value)} required /></label>
    <label>New password<input className={styles.input} type="password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
    <button className={styles.button} disabled={busy}>{busy ? "Updating..." : "Set password"}</button>
    {message && <div className={styles.notice} role="status">{message}</div>}
  </form>;
}
