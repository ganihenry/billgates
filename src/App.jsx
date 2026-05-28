import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import Dashboard from './pages/Dashboard'
import AddCustomerForm from './components/AddCustomerForm'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
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
        <Dashboard onLogout={handleLogout} key={refreshKey} />
        <div style={{ marginLeft: 240, padding: '0 40px 40px' }}>
          <AddCustomerForm onCustomerAdded={() => setRefreshKey(k => k + 1)} />
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>PayFlow Admin</h1>
        <p style={styles.subtitle}>Log in to manage your customers and payments</p>
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' },
  title: { margin: 0, fontSize: '24px', color: '#1a202c' },
  subtitle: { margin: 0, color: '#718096', fontSize: '14px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' },
  button: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: 'white', fontSize: '16px', cursor: 'pointer' },
  error: { color: '#e53e3e', fontSize: '14px', margin: 0 },
}