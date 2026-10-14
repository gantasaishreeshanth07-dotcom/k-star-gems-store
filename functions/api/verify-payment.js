
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json({ error: 'Payment gateway is not configured.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (
    typeof razorpay_order_id !== 'string' ||
    typeof razorpay_payment_id !== 'string' ||
    typeof razorpay_signature !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(razorpay_signature)
  ) {
    return json({ error: 'Invalid payment details.' }, 400);
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.RAZORPAY_KEY_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    const a = encoder.encode(expectedSignature);
    const b = encoder.encode(razorpay_signature.toLowerCase());

    let difference = a.length ^ b.length;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      difference |= a[i] ^ b[i];
    }

    if (difference !== 0) {
      return json({ verified: false, error: 'Payment signature is invalid.' }, 400);
    }

    const auth = btoa(
      `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    );

    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`,
      { headers: { authorization: `Basic ${auth}` } }
    );

    if (!response.ok) {
      return json({ verified: false, error: 'Unable to confirm payment status.' }, 502);
    }

    const payment = await response.json();

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== 'captured'
    ) {
      return json({ verified: false, error: 'Payment is not captured.' }, 400);
    }

    return json({ verified: true, paymentId: payment.id });
  } catch {
    return json({ verified: false, error: 'Payment verification failed.' }, 502);
  }
}
