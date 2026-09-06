"use client";
export default function GlobalError({reset}:{error:Error & {digest?:string};reset:()=>void}){
  return <html><body style={{margin:0,background:"#07111F",color:"white",fontFamily:"system-ui"}}><main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}><div style={{maxWidth:620,textAlign:"center"}}><p style={{color:"#22D3EE",letterSpacing:".15em",fontSize:11}}>ACE EXCHANGE</p><h1>Service temporarily unavailable.</h1><p style={{color:"#94A3B8",lineHeight:1.7}}>Please retry. Financial requests must be confirmed by the backend before they are treated as completed.</p><button onClick={reset} style={{marginTop:18,padding:"12px 18px",border:0,borderRadius:9,background:"#2563EB",color:"white",fontWeight:700}}>Retry</button></div></main></body></html>;
}
