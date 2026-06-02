import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for when a user completes the invite flow and gets logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else setUser(data.user)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (user) {
    return (
      <div style={{ background: '#0d0f14', minHeight: '100vh' }}>
        <Dashboard onLogout={handleLogout} />
      </div>
    )
  }

  return (
    <div style={ls.page}>
      {/* background grid */}
      <div style={ls.grid} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={ls.logoIcon}>💸</div>
          <div style={ls.logoText}>Bill Gates</div>
          <div style={ls.logoSub}>Sign in to your admin account</div>
        </div>

        {/* Card */}
        <div style={ls.card}>

          {/* Email */}
          <div style={ls.fieldGroup}>
            <label style={ls.label}>Email</label>
            <div style={{ position: 'relative' }}>
              <span style={ls.fieldIcon}>✉</span>
              <input
                style={ls.input}
                type="email"
                placeholder="admin@yourbusiness.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div style={ls.fieldGroup}>
            <label style={ls.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={ls.fieldIcon}>🔒</span>
              <input
                style={{ ...ls.input, paddingRight: 44 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                style={ls.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                type="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && <p style={{ color: '#F87171', fontSize: 13, margin: 0 }}>{error}</p>}

          <button style={ls.submitBtn} onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div style={ls.footer}>Payment Management System · Bill Gates</div>
      </div>
    </div>
  )
}

const ls = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d0f14',
    fontFamily: 'DM Sans, sans-serif',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(110,231,183,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(110,231,183,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  logoIcon: {
    width: 48, height: 48,
    background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)',
    borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22,
    margin: '0 auto 16px',
  },
  logoText: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 26, fontWeight: 800,
    letterSpacing: '-0.5px',
    color: '#F0F4FF',
    marginBottom: 6,
  },
  logoSub: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    background: '#13161e',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 11, fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  fieldIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 14,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 38px',
    background: '#1a1e2a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    fontSize: 14,
    color: '#F0F4FF',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'DM Sans, sans-serif',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },
  submitBtn: {
    width: '100%',
    padding: 12,
    background: 'linear-gradient(135deg, #6EE7B7, #34D399)',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontSize: 15, fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    marginTop: 4,
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    color: '#4B5563',
  },
}