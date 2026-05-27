import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if someone is already logged in when app loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      setUser(data.user)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  // If logged in, show the dashboard placeholder
  if (user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>✅ Login Successful!</h1>
          <p style={styles.subtitle}>Logged in as: <strong>{user.email}</strong></p>
          <p style={styles.subtitle}>Dashboard coming soon...</p>
          <button style={styles.button} onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    )
  }

  // If not logged in, show the login form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Tuition Admin</h1>
        <p style={styles.subtitle}>Log in to manage your students</p>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </div>
  )
}

// Basic styles to make it look presentable
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#1a202c',
  },
  subtitle: {
    margin: 0,
    color: '#718096',
    fontSize: '14px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4f46e5',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    margin: 0,
  },
}