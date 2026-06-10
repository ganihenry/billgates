import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { createPaymentForMonth } from '../lib/paymentUtils'

export default function AddCustomerForm({ onCustomerAdded }) {
  const [form, setForm] = useState({
    name: '', contact_name: '', contact_phone: '', monthly_fee: '', payment_day: '', reminder_days_before: '3',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.name || !form.contact_name || !form.contact_phone || !form.monthly_fee || !form.payment_day) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    const { data: inserted, error } = await supabase.from('customers').insert([{
      name: form.name,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      monthly_fee: parseFloat(form.monthly_fee),
      payment_day: parseInt(form.payment_day),
      reminder_days_before: parseInt(form.reminder_days_before) || 3,
    }]).select()
    console.log('inserted customer:', inserted)
    console.log('insert error:', error)

    if (error) {
      setError(error.message)
    } else {
      // Create a payment record for this month automatically
      await createPaymentForMonth(inserted[0].id, parseFloat(form.monthly_fee))
      setForm({ name: '', contact_name: '', contact_phone: '', monthly_fee: '', payment_day: '', reminder_days_before: '3' })
      onCustomerAdded()
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={f.grid}>
        <div style={f.group}>
          <label style={f.label}>Business / Name</label>
          <input style={f.input} name="name" placeholder="e.g. Sunrise Bakery" value={form.name} onChange={handleChange} />
        </div>
        <div style={f.group}>
          <label style={f.label}>Contact Person</label>
          <input style={f.input} name="contact_name" placeholder="e.g. Jane Tan" value={form.contact_name} onChange={handleChange} />
        </div>
        <div style={f.group}>
          <label style={f.label}>WhatsApp Phone</label>
          <input style={f.input} name="contact_phone" placeholder="+65 9123 4567" value={form.contact_phone} onChange={handleChange} />
        </div>
        <div style={f.group}>
          <label style={f.label}>Monthly Fee ($)</label>
          <input style={f.input} name="monthly_fee" placeholder="e.g. 1500" type="number" value={form.monthly_fee} onChange={handleChange} />
        </div>
        <div style={f.group}>
          <label style={f.label}>Payment Day</label>
          <input style={f.input} name="payment_day" placeholder="e.g. 15" type="number" value={form.payment_day} onChange={handleChange} />
        </div>
        <div style={f.group}>
          <label style={f.label}>Reminder (days before due)</label>
          <input style={f.input} name="reminder_days_before" placeholder="e.g. 3" type="number" value={form.reminder_days_before} onChange={handleChange} />
        </div>
      </div>

      {error && <p style={{ color: '#F87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={f.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : '+ Add Customer'}
        </button>
      </div>
    </div>
  )
}

const f = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginBottom: 16,
  },
  group: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: 11, fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '10px 14px',
    background: '#1a1e2a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    fontSize: 14,
    color: '#F0F4FF',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #6EE7B7, #34D399)',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
}