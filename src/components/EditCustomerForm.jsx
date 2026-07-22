import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function EditCustomerForm({ customer, onClose, onCustomerUpdated }) {
  const [form, setForm] = useState({
    name: customer.name,
    contact_name: customer.contact_name,
    contact_phone: customer.contact_phone,
    monthly_fee: customer.monthly_fee,
    payment_day: customer.payment_day,
    reminder_days_before: customer.reminder_days_before || 3,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    if (!form.name || !form.contact_name || !form.contact_phone || !form.monthly_fee || !form.payment_day) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase
      .from('customers')
      .update({
        name: form.name,
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        monthly_fee: parseFloat(form.monthly_fee),
        payment_day: parseInt(form.payment_day),
        reminder_days_before: parseInt(form.reminder_days_before) || 3,
      })
      .eq('id', customer.id)

    if (error) {
      setError(error.message)
    } else {
      onCustomerUpdated()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Edit Customer</h2>

        <label style={styles.label}>Business / Customer Name</label>
        <input style={styles.input} name="name" placeholder="e.g. Sunshine Tuition" value={form.name} onChange={handleChange} />

        <label style={styles.label}>Contact Person</label>
        <input style={styles.input} name="contact_name" placeholder="e.g. John Tan" value={form.contact_name} onChange={handleChange} />

        <label style={styles.label}>WhatsApp Phone</label>
        <input style={styles.input} name="contact_phone" placeholder="e.g. +6591234567" value={form.contact_phone} onChange={handleChange} />

        <label style={styles.label}>Monthly Fee (SGD)</label>
        <input style={styles.input} name="monthly_fee" placeholder="e.g. 200" type="number" value={form.monthly_fee} onChange={handleChange} />

        <label style={styles.label}>Payment Day (1–31)</label>
        <input style={styles.input} name="payment_day" placeholder="e.g. 15" type="number" value={form.payment_day} onChange={handleChange} />

        <label style={styles.label}>Reminder Days Before Due</label>
        <input style={styles.input} name="reminder_days_before" placeholder="e.g. 3" type="number" value={form.reminder_days_before} onChange={handleChange} />

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: '#13161e', padding: '32px', borderRadius: '16px',
    width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  title: { margin: 0, fontSize: '20px', fontWeight: 700, color: '#F0F4FF', fontFamily: 'Syne, sans-serif' },
  input: {
    padding: '11px 14px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: '#1a1e2a',
    fontSize: '14px', boxSizing: 'border-box', width: '100%',
    color: '#F0F4FF', fontFamily: 'DM Sans, sans-serif',
    outline: 'none', transition: 'border-color 0.15s',
  },
  buttons: { display: 'flex', gap: '12px', marginTop: '4px' },
  cancelBtn: {
    flex: 1, padding: '11px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: '#1a1e2a', color: '#9CA3AF',
    fontSize: '14px', cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
  },
  saveBtn: {
    flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #6EE7B7, #34D399)',
    color: '#000', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '6px',
    marginTop: '12px',
  },
  error: { color: '#F87171', fontSize: '13px', margin: 0 },
}