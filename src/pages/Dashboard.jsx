import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard({ onLogout }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    const { data, error } = await supabase.from('customers').select('*')
    if (error) console.error(error)
    else setCustomers(data)
    setLoading(false)
  }

  async function deleteCustomer(id) {
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) console.error(error)
    else fetchCustomers()
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Customer Dashboard</h1>
        <button style={styles.logoutBtn} onClick={onLogout}>Log Out</button>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p style={styles.empty}>No customers yet. Add one below!</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Business/Name</th>
              <th style={styles.th}>Contact Person</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Monthly Fee ($)</th>
              <th style={styles.th}>Due Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td style={styles.td}>{customer.name}</td>
                <td style={styles.td}>{customer.contact_name}</td>
                <td style={styles.td}>{customer.contact_phone}</td>
                <td style={styles.td}>${customer.monthly_fee}</td>
                <td style={styles.td}>Day {customer.due_date}</td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteCustomer(customer.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '32px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', color: '#1a202c', margin: 0 },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  empty: { color: '#718096' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0', color: '#4a5568' },
  td: { padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#2d3748' },
  deleteBtn: { padding: '6px 12px', backgroundColor: '#fed7d7', color: '#c53030', border: 'none', borderRadius: '6px', cursor: 'pointer' },
}