import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function EditCustomerForm({ customer, onClose, onCustomerUpdated }) {
  const [form, setForm] = useState({
    name: customer.name,
    contact_name: customer.contact_name,
    contact_phone: customer.contact_phone,
    monthly_fee: customer.monthly_fee,
    payment_day: customer.payment_day,
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

        <input style={styles.input} name="name" placeholder="Business / Customer Name" value={form.name} onChange={handleChange} />
        <input style={styles.input} name="contact_name" placeholder="Contact Person Name" value={form.contact_name} onChange={handleChange} />
        <input style={styles.input} name="contact_phone" placeholder="Contact Phone (WhatsApp)" value={form.contact_phone} onChange={handleChange} />
        <input style={styles.input} name="monthly_fee" placeholder="Monthly Fee ($)" type="number" value={form.monthly_fee} onChange={handleChange} />
        <input style={styles.input} name="payment_day" placeholder="Payment Day (e.g. 15)" type="number" value={form.payment_day} onChange={handleChange} />

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
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white', padding: '32px', borderRadius: '12px',
    width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
  },
  title: { margin: 0, fontSize: '20px', color: '#1a202c' },
  input: {
    padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0',
    fontSize: '15px', boxSizing: 'border-box', width: '100%',
  },
  buttons: { display: 'flex', gap: '12px', marginTop: '4px' },
  cancelBtn: {
    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0',
    backgroundColor: 'white', color: '#4a5568', fontSize: '15px', cursor: 'pointer',
  },
  saveBtn: {
    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
    backgroundColor: '#4f46e5', color: 'white', fontSize: '15px', cursor: 'pointer',
  },
  error: { color: '#e53e3e', fontSize: '14px', margin: 0 },
}