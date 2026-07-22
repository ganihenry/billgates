import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
    api: { bodyParser: false },
};

async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const sig = req.headers['stripe-signature'];
    const rawBody = await getRawBody(req);

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const paymentId = session.metadata?.payment_id;

        if (paymentId) {
            const receiptNumber = `RCP-${Date.now()}`

            const { error } = await supabase
                .from('payments')
                .update({
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                    stripe_session_id: session.id,
                    receipt_number: receiptNumber,
                })
                .eq('id', paymentId);

            if (error) {
                console.error('Supabase update failed:', error);
                return res.status(500).json({ error: 'DB update failed' });
            }
            // Fetch payment and customer details for receipt
            const { data: paymentData } = await supabase
                .from('payments')
                .select('*, customers(*)')
                .eq('id', paymentId)
                .single()
            // Generate PDF receipt
            const { generateReceiptPDF } = await import('../src/lib/generateReceipt.js')

            const pdfBytes = await generateReceiptPDF({
                customerName: paymentData?.customers?.name || 'Customer',
                amount: paymentData?.amount || 0,
                paidAt: paymentData?.paid_at || new Date().toISOString(),
                receiptNumber: receiptNumber,
            })
            // Convert PDF to base64
            const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
            const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`

            // Send PDF via Twilio WhatsApp
            const accountSid = process.env.TWILIO_ACCOUNT_SID
            const authToken = process.env.TWILIO_AUTH_TOKEN
            const fromNumber = process.env.TWILIO_WHATSAPP_FROM
            const toNumber = paymentData?.customers?.contact_phone

            if (toNumber) {
                await fetch(
                    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            From: `whatsapp:${fromNumber}`,
                            To: `whatsapp:${toNumber}`,
                            Body: `Hi ${paymentData?.customers?.contact_name}, thank you for your payment of $${paymentData?.amount}! Please find your receipt attached. Receipt #${receiptNumber}`,
                            MediaUrl: pdfDataUri,
                        }),
                    }
                )
            }
        }
    }

    res.status(200).json({ received: true });
}