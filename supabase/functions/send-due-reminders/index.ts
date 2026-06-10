import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = (globalThis as any).Deno.env.get('SUPABASE_URL')
    const supabaseKey = (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const accountSid = (globalThis as any).Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = (globalThis as any).Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromNumber = (globalThis as any).Deno.env.get('TWILIO_WHATSAPP_FROM')

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const currentDay = now.getDate()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Get all unpaid payments for this month with customer details
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*, customers(*)')
      .eq('month', currentMonth)
      .eq('status', 'unpaid')

    if (error) throw new Error(error.message)

    let sent = 0

    for (const payment of payments) {
      const customer = payment.customers
      if (!customer) continue

      const reminderDay = customer.payment_day - (customer.reminder_days_before || 3)

      // Only send if today is exactly the reminder day
      if (currentDay !== reminderDay) continue

      const message = `Hi ${customer.contact_name}, this is a reminder that your payment of $${customer.monthly_fee} is due on Day ${customer.payment_day} of this month. Please make payment at your earliest convenience. Thank you!`

      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${fromNumber}`,
            To: `whatsapp:${customer.contact_phone}`,
            Body: message,
          }),
        }
      )

      sent++
    }

    return new Response(
      JSON.stringify({ success: true, remindersSent: sent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})