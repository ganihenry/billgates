import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, customerName, amount, paymentDay, customMessage } = await req.json()
    const accountSid = (globalThis as any).Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = (globalThis as any).Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromNumber = (globalThis as any).Deno.env.get('TWILIO_WHATSAPP_FROM')

    const message = customMessage || `Hi ${customerName}, this is a reminder that your payment of $${amount} is due on Day ${paymentDay} of this month. Please make payment at your earliest convenience. Thank you!`
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${fromNumber}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Twilio error')
    }

    return new Response(JSON.stringify({ success: true, sid: data.sid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})