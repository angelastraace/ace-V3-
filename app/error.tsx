"use client";
import { useEffect } from "react";
export default function Error({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
  useEffect(()=>{console.error("ACE route error",error.digest||error.message)},[error]);
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"24px",background:"#07111F",color:"#fff",fontFamily:"system-ui"}}><div style={{maxWidth:620,textAlign:"center"}}><p style={{color:"#22D3EE",letterSpacing:".15em",fontSize:11}}>ACE EXCHANGE</p><h1>Something went wrong.</h1><p style={{color:"#94A3B8",lineHeight:1.7}}>The request could not be completed. No financial action should be assumed successful until the service confirms it.</p><button onClick={reset} style={{marginTop:18,padding:"12px 18px",border:0,borderRadius:9,background:"#2563EB",color:"white",fontWeight:700}}>Try again</button></div></main>;
}
