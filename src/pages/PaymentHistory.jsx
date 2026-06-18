import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PaymentHistory({ onBack, onNavigate }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchHistory()

    const channel = supabase
      .channel('payment-history-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payments' },
        () => fetchHistory()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchHistory() {
    const { data, error } = await supabase
      .from('payments')
      .select('*, customers(*)')
      .order('month', { ascending: false })

    if (error) console.error(error)
    else setHistory(data)
    setLoading(false)
  }

  // Get unique months for filter dropdown
  const months = [...new Set(history.map(p => p.month))].sort().reverse()

  const filtered = history.filter(p => {
    if (filterMonth && p.month !== filterMonth) return false
    if (filterStatus && p.status !== filterStatus) return false
    return true
  })

  const totalCollected = filtered
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalOutstanding = filtered
    .filter(p => p.status !== 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  function getStatusStyle(status) {
    if (status === 'paid') return s.statusPaid
    if (status === 'overdue') return s.statusOverdue
    return s.statusUnpaid
  }

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
              style={{ ...s.navItem, ...(label === 'Payments' ? s.navActive : {}) }}
              onClick={() => {
                if (label === 'Dashboard') onBack()
                if (label === 'Reports') onNavigate('reports')
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
        <div style={{ marginBottom: 36 }}>
          <div style={s.breadcrumb}>Payments</div>
          <div style={s.pageTitle}>Payment History</div>
        </div>

        {/* STAT CARDS */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statIcon}>💰</div>
            <div style={s.statLabel}>Total Collected</div>
            <div style={s.statValue}>${totalCollected.toLocaleString()}</div>
            <div style={s.statSub}>From filtered results</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statIcon}>⏳</div>
            <div style={s.statLabel}>Outstanding</div>
            <div style={s.statValue}>${totalOutstanding.toLocaleString()}</div>
            <div style={s.statSub}>Unpaid + overdue</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statIcon}>📋</div>
            <div style={s.statLabel}>Total Records</div>
            <div style={s.statValue}>{filtered.length}</div>
            <div style={s.statSub}>Matching filters</div>
          </div>
        </div>

        {/* FILTERS */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>
              All Payments
              <span style={s.countBadge}>{filtered.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                style={s.filterSelect}
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map(m => (
                  <option key={m} value={m}>{formatMonth(m)}</option>
                ))}
              </select>
              <select
                style={s.filterSelect}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '32px 24px', color: '#6B7280' }}>Loading history...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No records found</div>
              <div style={{ fontSize: 13 }}>Try adjusting your filters</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Month', 'Customer', 'Amount', 'Status', 'Paid At'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(payment => (
                  <tr key={payment.id} style={s.tr}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={s.td}>
                      <span style={{ fontWeight: 600 }}>{formatMonth(payment.month)}</span>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600 }}>{payment.customers?.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {payment.customers?.contact_name}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                        ${Number(payment.amount).toLocaleString()}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, ...getStatusStyle(payment.status) }}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#9CA3AF', fontSize: 13 }}>
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString('en-SG', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
  filterSelect: { padding: '8px 12px', background: '#1a1e2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#9CA3AF', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer' },
  th: { padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#1a1e2a', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.12s' },
  td: { padding: '15px 24px', fontSize: 14, verticalAlign: 'middle' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  statusPaid: { background: 'rgba(110,231,183,0.1)', color: '#6EE7B7', border: '1px solid rgba(110,231,183,0.2)' },
  statusUnpaid: { background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' },
  statusOverdue: { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' },
}