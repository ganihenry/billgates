import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Reports({ onNavigate }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    fetchAllPayments()

    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payments' },
        () => fetchAllPayments()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchAllPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('*, customers(*)')
      .order('month', { ascending: false })
    if (error) console.error(error)
    else setPayments(data)
    setLoading(false)
  }

  // Get current month as default
  const currentMonth = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()

  const months = [...new Set(payments.map(p => p.month))].sort().reverse()

  // Use selectedMonth or default to current month
  const activeMonth = selectedMonth || currentMonth

  const monthPayments = payments.filter(p => p.month === activeMonth)
  const paid = monthPayments.filter(p => p.status === 'paid')
  const unpaid = monthPayments.filter(p => p.status === 'unpaid')
  const overdue = monthPayments.filter(p => p.status === 'overdue')

  const totalCollected = paid.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalOutstanding = [...unpaid, ...overdue].reduce((sum, p) => sum + Number(p.amount), 0)
  const collectionRate = monthPayments.length > 0
    ? Math.round((paid.length / monthPayments.length) * 100)
    : 0

  function formatMonth(month) {
    const [year, m] = month.split('-')
    const date = new Date(year, parseInt(m) - 1)
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoMark}>
            <div style={s.logoIcon}>💸</div>
            Bill Gates
          </div>
        </div>
        <nav style={s.nav}>
          {[['⊞', 'Dashboard'], ['👥', 'Customers'], ['💳', 'Payments'], ['🔔', 'Reminders'], ['📊', 'Reports']].map(([icon, label]) => (
            <div key={label}
              style={{ ...s.navItem, ...(label === 'Reports' ? s.navActive : {}) }}
              onClick={() => {
                if (label === 'Dashboard') onNavigate('dashboard')
                if (label === 'Payments') onNavigate('history')
                if (label === 'Reminders') onNavigate('reminders')
              }}
            >
              <span style={{ width: 20, textAlign: 'center' }}>{icon}</span> {label}
            </div>
          ))}
        </nav>
        <div style={s.sidebarFooter}>
          <div style={s.userCard}>
            <div style={s.avatar}>BG</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={s.userName}>Admin</div>
              <div style={s.userRole}>Business Owner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        <div style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={s.breadcrumb}>Reports</div>
            <div style={s.pageTitle}>Monthly Summary</div>
          </div>
          <select
            style={s.monthSelect}
            value={activeMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {months.length === 0
              ? <option value={currentMonth}>{formatMonth(currentMonth)}</option>
              : months.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))
            }
          </select>
        </div>

        {loading ? (
          <div style={{ color: '#6B7280' }}>Loading report...</div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div style={s.statsGrid}>
              <div style={s.statCard}>
                <div style={s.statIcon}>💰</div>
                <div style={s.statLabel}>Total Collected</div>
                <div style={{ ...s.statValue, color: '#6EE7B7' }}>${totalCollected.toLocaleString()}</div>
                <div style={s.statSub}>{paid.length} customer{paid.length !== 1 ? 's' : ''} paid</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statIcon}>⏳</div>
                <div style={s.statLabel}>Outstanding</div>
                <div style={{ ...s.statValue, color: '#F87171' }}>${totalOutstanding.toLocaleString()}</div>
                <div style={s.statSub}>{unpaid.length + overdue.length} customer{unpaid.length + overdue.length !== 1 ? 's' : ''} pending</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statIcon}>📈</div>
                <div style={s.statLabel}>Collection Rate</div>
                <div style={{ ...s.statValue, color: collectionRate >= 75 ? '#6EE7B7' : collectionRate >= 50 ? '#F59E0B' : '#F87171' }}>
                  {collectionRate}%
                </div>
                <div style={s.statSub}>{paid.length} of {monthPayments.length} customers</div>
              </div>
            </div>

            {/* PAID */}
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <div style={s.sectionTitle}>
                  ✅ Paid
                  <span style={s.countBadge}>{paid.length}</span>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#6EE7B7' }}>
                  ${totalCollected.toLocaleString()}
                </div>
              </div>
              {paid.length === 0 ? (
                <div style={{ padding: '24px', color: '#6B7280', fontSize: 14 }}>No paid customers this month.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Customer', 'Amount', 'Paid On'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paid.map(p => (
                      <tr key={p.id} style={s.tr}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={s.td}>
                          <div style={{ fontWeight: 600 }}>{p.customers?.name}</div>
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{p.customers?.contact_name}</div>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#6EE7B7' }}>
                            ${Number(p.amount).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: '#9CA3AF', fontSize: 13 }}>
                          {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* OVERDUE */}
            {overdue.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <div style={s.sectionTitle}>
                    ⚠️ Overdue
                    <span style={s.countBadge}>{overdue.length}</span>
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>
                    ${overdue.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Customer', 'Amount', 'Due Day'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {overdue.map(p => (
                      <tr key={p.id} style={s.tr}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={s.td}>
                          <div style={{ fontWeight: 600 }}>{p.customers?.name}</div>
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{p.customers?.contact_name}</div>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#F59E0B' }}>
                            ${Number(p.amount).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: '#9CA3AF', fontSize: 13 }}>Day {p.customers?.payment_day}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* UNPAID */}
            {unpaid.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <div style={s.sectionTitle}>
                    ❌ Unpaid
                    <span style={s.countBadge}>{unpaid.length}</span>
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#F87171' }}>
                    ${unpaid.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Customer', 'Amount', 'Due Day'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unpaid.map(p => (
                      <tr key={p.id} style={s.tr}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={s.td}>
                          <div style={{ fontWeight: 600 }}>{p.customers?.name}</div>
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{p.customers?.contact_name}</div>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#F87171' }}>
                            ${Number(p.amount).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: '#9CA3AF', fontSize: 13 }}>Day {p.customers?.payment_day}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

const s = {
  sidebar: { width: 240, background: '#13161e', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'fixed', height: '100vh', top: 0, left: 0 },
  logo: { padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  logoMark: { fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 },
  nav: { padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#9CA3AF', cursor: 'pointer' },
  navActive: { background: 'rgba(110,231,183,0.1)', color: '#6EE7B7' },
  sidebarFooter: { padding: '20px 12px 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  userCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#1a1e2a' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #6EE7B7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 600 },
  userRole: { fontSize: 11, color: '#6B7280' },
  main: { marginLeft: 240, flex: 1, padding: '36px 40px' },
  breadcrumb: { fontSize: 12, color: '#6B7280', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' },
  pageTitle: { fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' },
  monthSelect: { padding: '10px 16px', background: '#13161e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#F0F4FF', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 },
  statCard: { background: '#13161e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 24px', position: 'relative', overflow: 'hidden' },
  statIcon: { position: 'absolute', top: 20, right: 20, fontSize: 22, opacity: 0.4 },
  statLabel: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 },
  statValue: { fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 700, letterSpacing: '-1px', marginBottom: 6 },
  statSub: { fontSize: 12, color: '#9CA3AF' },
  section: { background: '#13161e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  sectionHeader: { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 },
  countBadge: { background: '#1a1e2a', color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 20 },
  th: { padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#1a1e2a', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.12s' },
  td: { padding: '15px 24px', fontSize: 14, verticalAlign: 'middle' },
}