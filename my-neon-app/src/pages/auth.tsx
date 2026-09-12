import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { neon } from '../lib/neon'

export function Auth() {
  const { pathname } = useParams()
  const navigate = useNavigate()
  const mode = pathname === 'sign-up' ? 'sign-up' : 'sign-in'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    neon.auth.getSession().then(({ data }) => {
      if (data) navigate('/account/profile', { replace: true })
    })
  }, [navigate])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setStatus('')
    const result = mode === 'sign-in'
      ? await neon.auth.signIn.email({ email, password })
      : await neon.auth.signUp.email({ email, password, name: email.split('@')[0] })

    if (result.error) setStatus(result.error.message || 'Authentication failed.')
    else navigate('/account/profile')
    setBusy(false)
  }

  return (
    <main className="shell">
      <header className="topbar"><Link className="mark" to="/">NEON / AUTH</Link><span className="connection"><i /> Connected</span></header>
      <section className="auth-layout">
        <div className="intro"><p className="eyebrow">IDENTITY, SIMPLIFIED</p><h1>Access your<br /><em>next chapter.</em></h1><p className="lede">Sign in securely or create your Neon Auth account in a moment.</p></div>
        <form className="auth-card" onSubmit={submit}>
          <div className="tabs"><Link className={mode === 'sign-in' ? 'active' : ''} to="/auth/sign-in">Sign in</Link><Link className={mode === 'sign-up' ? 'active' : ''} to="/auth/sign-up">Create account</Link></div>
          <h2>{mode === 'sign-in' ? 'Good to see you.' : 'Start here.'}</h2><p className="card-copy">{mode === 'sign-in' ? 'Enter your details to continue.' : 'Create your Neon Auth account in a moment.'}</p>
          <label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
          <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength={8} required /></label>
          <button className="submit" disabled={busy}>{busy ? 'Working...' : mode === 'sign-in' ? 'Continue' : 'Create account'} <span>↗</span></button>
          {status && <p className="status" role="status">{status}</p>}<p className="fine-print">By continuing, you agree to the terms and acknowledge the privacy policy.</p>
        </form>
      </section>
      <footer><span>NEON AUTH QUICKSTART</span><span>VITE + REACT + TYPESCRIPT</span></footer>
    </main>
  )
}
