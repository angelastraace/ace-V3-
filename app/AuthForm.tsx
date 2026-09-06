"use client";
import { FormEvent, useState } from "react";
import styles from "./PlatformShell.module.css";

export default function AuthForm({mode,nextPath}:{mode:"login"|"register";nextPath?:string}){
  const [msg,setMsg]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setBusy(true); setMsg("");
    const fd=new FormData(e.currentTarget);
    const payload={email:String(fd.get("email")||"").trim(),password:String(fd.get("password")||""),...(mode==="register"?{termsAccepted:fd.get("termsAccepted")==="on",termsVersion:process.env.NEXT_PUBLIC_TERMS_VERSION||"2026-09-06",privacyVersion:process.env.NEXT_PUBLIC_PRIVACY_VERSION||"2026-09-06"}:{})};
    try{
      const r=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),credentials:"include"});
      const d=await r.json().catch(()=>({}));
      if(r.ok){
        if(mode==="login"){
          const target=nextPath&&nextPath.startsWith("/")&&!nextPath.startsWith("//")?nextPath:"/dashboard";
          window.location.assign(target);
          return;
        }
        setMsg(d.message||"Account request accepted. Complete any verification steps sent by the identity provider.");
      }else setMsg(d.reason||d.message||"Authentication provider is not configured or rejected the request.");
    }catch{setMsg("Authentication service unavailable.");}
    finally{setBusy(false)}
  }
  return <form className={styles.form} onSubmit={submit}>
    <label><span className="sr-only">Email</span><input className={styles.input} required name="email" type="email" autoComplete="email" inputMode="email" placeholder="Email"/></label>
    <label><span className="sr-only">Password</span><input className={styles.input} required minLength={12} name="password" type="password" autoComplete={mode==="login"?"current-password":"new-password"} placeholder="Password"/></label>
    {mode==="register"&&<label style={{display:"flex",gap:"10px",alignItems:"flex-start",color:"#94A3B8",fontSize:"12px",lineHeight:1.5}}><input required name="termsAccepted" type="checkbox" style={{marginTop:"3px"}}/><span>I agree to the <a href="/terms" style={{color:"#93C5FD"}}>Terms</a> and acknowledge the <a href="/privacy" style={{color:"#93C5FD"}}>Privacy Policy</a>.</span></label>}
    <button className={styles.button} disabled={busy} aria-busy={busy}>{busy?"Checking…":mode==="login"?"Sign in":"Create account"}</button>
    {msg&&<div className={styles.notice} role="status">{msg}</div>}
  </form>
}
