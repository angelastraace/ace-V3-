import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { neon } from '../lib/neon'

type Session = { user?: { name?: string; email?: string } }

export function Account() {
  const { pathname } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    neon.auth.getSession().then(({ data }) => {
      if (!data) navigate('/auth/sign-in', { replace: true })
      else setSession(data as unknown as Session)
    })
  }, [navigate])

  async function signOut() {
    await neon.auth.signOut()
    navigate('/auth/sign-in')
  }

  if (!session) return <main className="shell"><p className="lede">Loading account...</p></main>

  return (
    <main className="shell">
      <header className="topbar"><Link className="mark" to="/">NEON / AUTH</Link><button className="text-button" onClick={signOut}>Sign out</button></header>
      <section className="account-panel"><p className="eyebrow">ACCOUNT / {pathname?.toUpperCase()}</p><h1>Welcome back.</h1><p className="lede">Your Neon Auth session is active and ready for the app.</p><div className="identity"><span className="avatar">{session.user?.name?.[0] || session.user?.email?.[0] || '?'}</span><div><strong>{session.user?.name || 'Neon user'}</strong><span>{session.user?.email}</span></div></div></section>
    </main>
  )
}
