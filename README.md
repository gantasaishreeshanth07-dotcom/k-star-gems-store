# K Star Gems — starter online store

A responsive luxury black-and-gold storefront for K Star Gems. It includes a product grid, category filters, cart, customer checkout form, a COD request draft, and starter Razorpay server endpoints designed for Cloudflare Pages Functions.

## Important before launch

- This is a starter/demo. Product images are CSS gemstone illustrations, and all six sample products/prices are placeholders. Replace them with accurate stock, real product photos, exact specifications, return/shipping policies, and only make certification claims you can substantiate.
- COD currently creates a copyable order request only; it does not save an order or notify the seller. Connect a durable database/order-management service and a merchant notification channel before selling.
- Online payment endpoints create and verify Razorpay orders server-side. Add secrets in Cloudflare Pages settings. Start with **test mode**. Do not put the Razorpay key secret in browser code, GitHub, or this README.
- Before live sales, add durable order storage, stock checks, delivery/tax calculations, refund/cancellation handling, privacy/terms/returns/shipping pages, and an operational process for fulfilment. Test all payment states. Gateway activation/KYC is required for live payments.
- The front-end sample prices and server catalog in `functions/api/create-order.js` must be kept in sync.

## Run locally

Open `index.html` in a browser to inspect the visual storefront and cart. The online payment endpoint will not work locally unless you run a Pages-compatible development environment and set environment variables.

## Publish on Cloudflare Pages (free pages.dev URL)

1. Create a GitHub account at https://github.com/ if needed.
2. Create a **public or private** repository named `k-star-gems-store`.
3. Upload all files/folders from this project to the repository root. Keep `functions/api/create-order.js` and `functions/api/verify-payment.js` in that exact path.
4. Sign in to https://dash.cloudflare.com/ and open **Workers & Pages → Create → Pages → Connect to Git** (labels can change).
5. Select the GitHub repository. For this plain HTML project, use no framework preset, leave build command blank, and set the build output directory to `/` or the repository root as prompted. Deploy.
6. Cloudflare provides a `*.pages.dev` URL. Open it and test mobile layout, filters, cart and checkout form.
7. In the Pages project settings, add environment variables/secrets for both **Preview** and **Production** as needed:
   - `RAZORPAY_KEY_ID` = Razorpay test-mode Key ID
   - `RAZORPAY_KEY_SECRET` = Razorpay test-mode Key Secret (secret value; never commit it)
   Redeploy after adding them.

## Set up Razorpay test mode

1. Create/sign in to a Razorpay merchant account at https://razorpay.com/ and complete the requested business/account information.
2. In the dashboard, switch to Test Mode and generate API keys. Use test keys only while testing.
3. Add the keys as Cloudflare Pages environment variables/secrets as described above.
4. Make a test checkout. Check the Razorpay dashboard and test failed/cancelled payment cases as well as successful payments.
5. The included API verifies the signature and fetches payment status, but it intentionally does **not** save the order. Add persistent order storage before real sales; otherwise a verified payment will not create a fulfilment record.
6. When ready, complete Razorpay activation/KYC, use Live Mode keys stored as production secrets, and complete a live-readiness review.

Official references:
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Razorpay Standard Checkout: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
- Razorpay account/API key guidance: https://razorpay.com/docs/
