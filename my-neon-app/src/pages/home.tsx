import { Link } from 'react-router-dom'

export function Home() {
  return (
    <main className="shell">
      <header className="topbar"><span className="mark">NEON / AUTH</span><span className="connection"><i /> Connected</span></header>
      <section className="auth-layout">
        <div className="intro"><p className="eyebrow">NEON AUTH QUICKSTART</p><h1>Build with<br /><em>confidence.</em></h1><p className="lede">A focused authentication surface powered by Neon Auth and built for modern product teams.</p><div className="signal"><span>01</span><span>Secure session management</span></div><div className="signal"><span>02</span><span>One client, one source of truth</span></div></div>
        <div className="auth-card"><p className="eyebrow">WELCOME</p><h2>Your account starts here.</h2><p className="card-copy">Sign in to continue or create a new Neon Auth account.</p><Link className="submit" to="/auth/sign-in">Continue <span>↗</span></Link><p className="fine-print">Authentication is handled securely by Neon Auth.</p></div>
      </section>
      <footer><span>NEON AUTH QUICKSTART</span><span>VITE + REACT + TYPESCRIPT</span></footer>
    </main>
  )
}
