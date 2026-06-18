import { createPaymentLink } from '../lib/stripeUtils';
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import EditCustomerForm from '../components/EditCustomerForm'
import AddCustomerForm from '../components/AddCustomerForm'
import { getPaymentsForMonth, updatePaymentStatus, sendWhatsAppReminder } from '../lib/paymentUtils'
import { createPaymentLink } from '../lib/stripeUtils'

export default function Dashboard({ onLogout, onNavigate }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [payments, setPayments] = useState([])

  useEffect(() => {
    fetchCustomers()
    fetchPayments()
    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payments' },
        (payload) => {
          setPayments(prev =>
            prev.map(p => p.id === payload.new.id ? payload.new : p)
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [])

  async function fetchCustomers() {
    const { data, error } = await supabase.from('customers').select('*')
    if (error) console.error(error)
    else setCustomers(data)
    setLoading(false)
  }
  async function fetchTemplates() {
    const { data } = await supabase.from('reminder_templates').select('*')
    if (data) {
      const map = {}
      data.forEach(t => map[t.type] = t.message)
      return map
    }
    return {}
  }

  async function applyTemplate(message, customer, payment) {
    let paymentLink = ''
    try {
      paymentLink = await createPaymentLink(
        payment?.id,
        customer.id,
        customer.name,
        customer.monthly_fee
      )
    } catch (err) {
      console.error('Failed to generate payment link:', err)
    }
    return message
      .replace(/{name}/g, customer.contact_name)
      .replace(/{amount}/g, Number(customer.monthly_fee).toLocaleString())
      .replace(/{due_date}/g, `Day ${customer.payment_day}`)
      .replace(/{payment_link}/g, paymentLink)
  }
  async function fetchPayments() {
    const data = await getPaymentsForMonth()
    setPayments(data)
  }

  async function deleteCustomer(id) {
    if (!window.confirm('Are you sure you want to delete this customer? All payment records will also be deleted.')) return

    // Delete related records first
    await supabase.from('reminder_logs').delete().eq('customer_id', id)
    await supabase.from('payments').delete().eq('customer_id', id)

    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) {
      console.error(error)
      alert('❌ Failed to delete customer: ' + error.message)
    } else {
      fetchCustomers()
      fetchPayments()
    }
  }

  async function handleSendReminder(customer) {
    const payment = getPayment(customer.id)
    const templates = await fetchTemplates()
    const type = payment?.status === 'overdue' ? 'overdue' : 'pre_due'
    const message = await applyTemplate(templates[type] || '', customer, payment)
    const result = await sendWhatsAppReminder(customer, message)

    await supabase.from('reminder_logs').insert({
      customer_id: customer.id,
      customer_name: customer.name,
      type: 'manual',
      message: `Manual reminder sent to ${customer.contact_name}`,
      status: result.success ? 'sent' : 'failed',
    })

    if (result.success) {
      alert(`✅ Reminder sent to ${customer.contact_name}!`)
    } else {
      alert(`❌ Failed to send: ${result.error}`)
    }
  }

  const totalFees = customers.reduce((sum, c) => sum + Number(c.monthly_fee), 0)

  function getPayment(customerId) {
    console.log('looking for customerId:', customerId, 'type:', typeof customerId)
    console.log('payments:', payments)
    return payments.find(p => p.customer_id === customerId)
  }

  async function handleStatusChange(payment, newStatus) {
    await updatePaymentStatus(payment.id, newStatus)
    fetchPayments()
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
              style={{ ...s.navItem, ...(label === 'Dashboard' ? s.navActive : {}) }}
              onClick={() => {
                if (label === 'Payments') onNavigate('history')
                if (label === 'Reminders') onNavigate('reminders')
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
            <button style={s.logoutBtn} onClick={onLogout} title="Log out">→</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        <div style={{ marginBottom: 36 }}>
          <div style={s.breadcrumb}>Overview</div>
          <div style={s.pageTitle}>
            Customer Dashboard
            <span style={s.liveBadge}>● Live</span>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statIcon}>💰</div>
            <div style={s.statLabel}>Total Monthly Fees</div>
            <div style={s.statValue}>${totalFees.toLocaleString()}</div>
            <div style={s.statSub}>{customers.length} active customers</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statIcon}>👥</div>
            <div style={s.statLabel}>Total Customers</div>
            <div style={s.statValue}>{customers.length}</div>
            <div style={s.statSub}>Registered in system</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statIcon}>📅</div>
            <div style={s.statLabel}>Next Due</div>
            <div style={s.statValue}>
              {customers.length > 0
                ? `Day ${Math.min(...customers.map(c => c.payment_day))}`
                : '—'}
            </div>
            <div style={s.statSub}>Earliest payment day</div>
          </div>
        </div>

        {/* CUSTOMER TABLE */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>
              All Customers
              <span style={s.countBadge}>{customers.length}</span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '32px 24px', color: '#6B7280' }}>Loading customers...</div>
          ) : customers.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No customers yet</div>
              <div style={{ fontSize: 13 }}>Add your first customer using the form below</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Customer', 'Phone', 'Monthly Fee', 'Payment Day', 'Status', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  const payment = getPayment(c.id)
                  return (
                    <tr key={c.id} style={s.tr}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={s.td}>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{c.contact_name}</div>
                      </td>
                      <td style={{ ...s.td, color: '#9CA3AF', fontSize: 13 }}>{c.contact_phone}</td>
                      <td style={s.td}>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                          ${Number(c.monthly_fee).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#9CA3AF', fontSize: 13 }}>Day {c.payment_day}</td>
                      <td style={s.td}>
                        {(() => {
                          const payment = getPayment(c.id)
                          if (!payment) return <span style={s.badgeUnpaid}>Unpaid</span>
                          return (
                            <select
                              value={payment.status}
                              onChange={e => handleStatusChange(payment, e.target.value)}
                              style={{
                                ...s.statusSelect,
                                ...(payment.status === 'paid' ? s.selectPaid
                                  : payment.status === 'overdue' ? s.selectOverdue
                                    : s.selectUnpaid)
                              }}
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                            </select>
                          )
                        })()}
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={s.btnEdit}
                            onMouseEnter={e => { e.target.style.color = '#3B82F6'; e.target.style.borderColor = 'rgba(59,130,246,0.3)'; e.target.style.background = 'rgba(59,130,246,0.08)' }}
                            onMouseLeave={e => { e.target.style.color = '#9CA3AF'; e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.background = '#1a1e2a' }}
                            onClick={() => setEditingCustomer(c)}>Edit</button>
                          <button style={s.btnDelete}
                            onMouseEnter={e => { e.target.style.color = '#F87171'; e.target.style.borderColor = 'rgba(248,113,113,0.2)'; e.target.style.background = 'rgba(248,113,113,0.08)' }}
                            onMouseLeave={e => { e.target.style.color = '#6B7280'; e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent' }}
                            onClick={() => deleteCustomer(c.id)}>Delete</button>
                          <button style={{
                            ...s.btnRemind,
                            ...(payment?.status === 'paid' ? { opacity: 0.3, cursor: 'not-allowed' } : {})
                          }}
                            onMouseEnter={e => { if (payment?.status !== 'paid') { e.target.style.color = '#6EE7B7'; e.target.style.borderColor = 'rgba(110,231,183,0.3)'; e.target.style.background = 'rgba(110,231,183,0.08)' } }}
                            onMouseLeave={e => { e.target.style.color = '#9CA3AF'; e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.background = '#1a1e2a' }}
                            onClick={() => payment?.status !== 'paid' && handleSendReminder(c)}
                            disabled={payment?.status === 'paid'}>
                            Remind
                          </button>
                          {(payment?.status === 'unpaid' || payment?.status === 'overdue') && (
                            <button
                              style={s.btnRemind}
                              onMouseEnter={e => { e.target.style.color = '#818CF8'; e.target.style.borderColor = 'rgba(129,140,248,0.3)'; e.target.style.background = 'rgba(129,140,248,0.08)' }}
                              onMouseLeave={e => { e.target.style.color = '#9CA3AF'; e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.background = '#1a1e2a' }}
                              onClick={async () => {
                                try {
                                  const url = await createPaymentLink(
                                    payment.id,
                                    c.id,
                                    c.name,
                                    c.monthly_fee
                                  );
                                  await navigator.clipboard.writeText(url);
                                  alert('Payment link copied! Paste it into WhatsApp.');
                                } catch (err) {
                                  alert('Error generating link: ' + err.message);
                                }
                              }}>
                              💳 PayNow
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ADD CUSTOMER FORM — dark themed, right below table */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Add New Customer</div>
          </div>
          <AddCustomerForm onCustomerAdded={async () => {
            await fetchCustomers()
            await fetchPayments()
          }} />        </div>

        {editingCustomer && (
          <EditCustomerForm
            customer={editingCustomer}
            onClose={() => setEditingCustomer(null)}
            onCustomerUpdated={fetchCustomers}
          />
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
  logoutBtn: { background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 16 },
  main: { marginLeft: 240, flex: 1, padding: '36px 40px' },
  breadcrumb: { fontSize: 12, color: '#6B7280', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' },
  pageTitle: { fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 12 },
  liveBadge: { fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 500, background: 'rgba(110,231,183,0.12)', color: '#6EE7B7', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(110,231,183,0.2)' },
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
  btnEdit: { padding: '6px 12px', borderRadius: 6, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)', background: '#1a1e2a', color: '#9CA3AF', transition: 'all 0.15s' },
  btnDelete: { padding: '6px 12px', borderRadius: 6, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid transparent', background: 'transparent', color: '#6B7280', transition: 'all 0.15s' },
  badgeUnpaid: { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' },
  statusSelect: { padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: '1px solid', cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans, sans-serif' },
  selectPaid: { background: 'rgba(110,231,183,0.1)', color: '#6EE7B7', borderColor: 'rgba(110,231,183,0.2)' },
  selectUnpaid: { background: 'rgba(248,113,113,0.1)', color: '#F87171', borderColor: 'rgba(248,113,113,0.2)' },
  selectOverdue: { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.2)' },
  btnRemind: { padding: '6px 12px', borderRadius: 6, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)', background: '#1a1e2a', color: '#9CA3AF', transition: 'all 0.15s' },
}