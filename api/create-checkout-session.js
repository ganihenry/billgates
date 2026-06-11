import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { paymentId, customerId, customerName, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['paynow'],
      line_items: [{
        price_data: {
          currency: 'sgd',
          product_data: { name: `Monthly Payment — ${customerName}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.VITE_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/`,
      metadata: {
        payment_id: paymentId,
        customer_id: customerId,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}