export async function createPaymentLink(paymentId, customerId, customerName, amount) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, customerId, customerName, amount }),
  });

  if (!res.ok) throw new Error('Failed to create payment link');
  const data = await res.json();
  return data.url;
}