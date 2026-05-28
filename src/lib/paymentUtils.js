import { supabase } from './supabaseClient'

// Returns current month as "YYYY-MM" e.g. "2026-06"
export function getCurrentMonth() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Creates a payment record for a customer for the current month
export async function createPaymentForMonth(customerId, amount) {
    const month = getCurrentMonth()

    // Check if one already exists to avoid duplicates
    const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('customer_id', customerId)
        .eq('month', month)

    if (existing && existing.length > 0) return

    await supabase.from('payments').insert([{
        customer_id: customerId,
        month,
        amount,
        status: 'unpaid',
    }])
}

// Fetches payment status for all customers for the current month
export async function getPaymentsForMonth() {
    const month = getCurrentMonth()
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('month', month)
    if (error) console.error(error)
    return data || []
}

// Updates a payment status manually
export async function updatePaymentStatus(paymentId, status) {
    const { error } = await supabase
        .from('payments')
        .update({
            status,
            paid_at: status === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', paymentId)
    if (error) console.error(error)
}