import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Reminders({ onLogout, onNavigate }) {
  const [templates, setTemplates] = useState({ pre_due: '', overdue: '', payment_confirmed: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    const { data } = await supabase.from('reminder_templates').select('*')
    if (data) {
      const map = {}
      data.forEach(t => map[t.type] = t.message)
      setTemplates(map)
    }
  }

  async function saveTemplate(type) {
    setSaving(true)
    await supabase
      .from('reminder_templates')
      .update({ message: templates[type], updated_at: new Date().toISOString() })
      .eq('type', type)
    setSaving(false)
    alert('✅ Template saved!')
  }

  function previewMessage(type) {
    return (templates[type] || '')
      .replace(/{name}/g, 'John Tan')
      .replace(/{amount}/g, '2,000')
      .replace(/{due_date}/g, '15 Jun 2026')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
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
              style={{ ...s.navItem, ...(label === 'Reminders' ? s.navActive : {}) }}
              onClick={() => {
                if (label === 'Dashboard') onNavigate('dashboard')
                if (label === 'Payments') onNavigate('history')
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
            <button style={s.logoutBtn} onClick={onLogout}>→</button>
          </div>
        </div>
      </aside>
      <main style={s.main}>
        <div style={{ marginBottom: 36 }}>
          <div style={s.breadcrumb}>Reminders</div>
          <div style={s.pageTitle}>Reminder Centre</div>
        </div>
        <p style={{ color: '#9CA3AF' }}>Coming soon...</p>
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
  pageTitle: { fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' },
  section: { background: '#13161e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  sectionHeader: { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  sectionTitle: { fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700 },
  th: { padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#1a1e2a', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.07)' },
  td: { padding: '15px 24px', fontSize: 14, verticalAlign: 'middle' },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  textarea: { width: '100%', background: '#1a1e2a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#fff', padding: '12px', fontSize: 14, fontFamily: 'DM Sans, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  preview: { background: '#1a1e2a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#E5E7EB', lineHeight: 1.6, minHeight: 100, whiteSpace: 'pre-wrap' },
  saveBtn: { marginTop: 12, padding: '8px 20px', background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  blastBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  typeBadge: { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: '1px solid' },
}