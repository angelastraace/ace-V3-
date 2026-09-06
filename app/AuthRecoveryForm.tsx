"use client";
import { FormEvent, useState } from "react";
import styles from "./PlatformShell.module.css";

type Mode="forgot-password"|"reset-password"|"verify-email";
export default function AuthRecoveryForm({mode,token}:{mode:Mode;token?:string}){
  const [msg,setMsg]=useState("");const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMsg("");const fd=new FormData(e.currentTarget);const payload:Record<string,string>={};for(const [k,v] of fd.entries())payload[k]=String(v);if(token)payload.token=token;try{const r=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),credentials:"include"});const d=await r.json().catch(()=>({}));setMsg(r.ok?(d.message||"Request accepted. Follow the instructions from the identity provider."):(d.reason||d.message||"Request could not be completed."));}catch{setMsg("Identity service unavailable.");}finally{setBusy(false)}}
  return <form className={styles.form} onSubmit={submit}>
    {mode==="forgot-password"&&<label><span className="sr-only">Email</span><input className={styles.input} required name="email" type="email" autoComplete="email" placeholder="Email"/></label>}
    {mode==="reset-password"&&<label><span className="sr-only">New password</span><input className={styles.input} required minLength={12} name="password" type="password" autoComplete="new-password" placeholder="New password"/></label>}
    {mode==="verify-email"&&!token&&<label><span className="sr-only">Verification token</span><input className={styles.input} required name="token" type="text" autoComplete="one-time-code" placeholder="Verification token"/></label>}
    <button className={styles.button} disabled={busy} aria-busy={busy}>{busy?"Checking…":mode==="forgot-password"?"Send reset instructions":mode==="reset-password"?"Reset password":"Verify email"}</button>
    {msg&&<div className={styles.notice} role="status">{msg}</div>}
  </form>;
}
