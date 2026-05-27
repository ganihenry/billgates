import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AddCustomerForm({ onCustomerAdded }) {
  const [form, setForm] = useState({
    name: '',
    contact_name: '',
    contact_phone: '',
    monthly_fee: '',
    payment_day: '',
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
    const { error } = await supabase.from('customers').insert([{
      name: form.name,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      monthly_fee: parseFloat(form.monthly_fee),
      payment_day: parseInt(form.payment_day),
    }])
    if (error) {
      setError(error.message)
    } else {
      setForm({ name: '', contact_name: '', contact_phone: '', monthly_fee: '', payment_day: '' })
      onCustomerAdded()
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Add New Customer</h2>

      <input style={styles.input} name="name" placeholder="Business / Customer Name" value={form.name} onChange={handleChange} />
      <input style={styles.input} name="contact_name" placeholder="Contact Person Name" value={form.contact_name} onChange={handleChange} />
      <input style={styles.input} name="contact_phone" placeholder="Contact Phone (WhatsApp)" value={form.contact_phone} onChange={handleChange} />
      <input style={styles.input} name="monthly_fee" placeholder="Monthly Fee ($)" type="number" value={form.monthly_fee} onChange={handleChange} />
      <input style={styles.input} name="payment_day" placeholder="Payment Day (day of month, e.g. 15)" type="number" value={form.payment_day} onChange={handleChange} />
      {error && <p style={styles.error}>{error}</p>}

      <button style={styles.button} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Adding...' : 'Add Customer'}
      </button>
    </div>
  )
}

const styles = {
  container: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginTop: '32px' },
  title: { fontSize: '18px', color: '#1a202c', marginTop: 0, marginBottom: '16px' },
  input: { display: 'block', width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px', boxSizing: 'border-box' },
  button: { padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  error: { color: '#e53e3e', fontSize: '14px' },
}