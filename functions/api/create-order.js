
const CATALOG = {
  ruby: { name: 'Ruby Radiance', price: 4500 },
  emerald: { name: 'Emerald Essence', price: 6200 },
  sapphire: { name: 'Blue Sapphire', price: 7800 },
  pearl: { name: 'Pearl Grace Necklace', price: 3500 },
  ring: { name: 'Ruby Signature Ring', price: 5400 },
  pendant: { name: 'Emerald Pendant', price: 4200 }
};

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

  if (!Array.isArray(body.items) ||
      body.items.length < 1 ||
      body.items.length > 20) {
    return json({ error: 'Your cart is empty or invalid.' }, 400);
  }

  if (!body.customer ||
      !String(body.customer.name || '').trim() ||
      !String(body.customer.phone || '').trim() ||
      !String(body.customer.address || '').trim()) {
    return json({
      error: 'Name, phone and delivery address are required.'
    }, 400);
  }

  let amount = 0;

  for (const item of body.items) {
    const product = CATALOG[item.id];
    const quantity = Number(item.quantity);

    if (!product ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10) {
      return json({ error: 'An item in your cart is invalid.' }, 400);
    }

    amount += product.price * quantity;
  }

  if (amount < 1 || amount > 10000000) {
    return json({ error: 'Order total is outside the allowed range.' }, 400);
  }

  try {
    const auth = btoa(
      `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    );

    const response = await fetch(
      'https://api.razorpay.com/v1/orders',
      {
        method: 'POST',
        headers: {
          authorization: `Basic ${auth}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount * 100,
          currency: 'INR',
          receipt: `ksg_${crypto.randomUUID()}`,
          notes: {
            customer_name: String(body.customer.name).slice(0, 200),
            customer_phone: String(body.customer.phone).slice(0, 30)
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return json({
        error: 'Could not create payment order. Check Razorpay test credentials.'
      }, 502);
    }

    return json({
      keyId: env.RAZORPAY_KEY_ID,
      orderId: result.id,
      amount: result.amount,
      currency: result.currency
    });
  } catch {
    return json({ error: 'Payment service is temporarily unavailable.' }, 502);
  }
}
