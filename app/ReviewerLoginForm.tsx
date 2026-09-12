"use client";
import { FormEvent, useState } from "react";
import styles from "./PlatformShell.module.css";

export default function ReviewerLoginForm({ nextPath }: { nextPath?: string }) {
  const [role, setRole] = useState<"user" | "admin">("admin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/reviewer", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ role }) });
      if (!response.ok) { setMessage("Reviewer sign-in is unavailable."); return; }
      const target = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : role === "admin" ? "/admin" : "/dashboard";
      window.location.assign(target);
    } catch { setMessage("Reviewer sign-in is unavailable."); } finally { setBusy(false); }
  }
  return <form className={styles.form} onSubmit={submit}><p className={styles.muted}>Preview reviewer access only. It is unavailable in Production.</p><label><span className="sr-only">Role</span><select className={styles.input} value={role} onChange={(event) => setRole(event.target.value as "user" | "admin")}><option value="admin">Admin</option><option value="user">User</option></select></label><button className={styles.button} disabled={busy}>{busy ? "Signing in…" : `Continue as ${role}`}</button>{message && <div className={styles.notice} role="status">{message}</div>}</form>;
}
