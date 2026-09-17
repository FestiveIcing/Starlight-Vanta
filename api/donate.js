import Stripe from "stripe";

const MIN_CENTS = 200;
const MAX_CENTS = 50000;
const PRESETS = [300, 500, 1000, 2500];

// A live key set explicitly always wins over whatever the Vercel Stripe
// integration injected, so going live never means fighting the integration for
// ownership of STRIPE_SECRET_KEY.
function secretKey() {
  return process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "";
}

function publishableKey() {
  return process.env.STRIPE_LIVE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "";
}

function stripeClient() {
  const key = secretKey();
  return key ? new Stripe(key, { apiVersion: "2025-08-27.basil" }) : null;
}

export default async function handler(request, response) {
  response.setHeader("cache-control", "no-store");

  const publishable = publishableKey();
  const stripe = stripeClient();
  const enabled = Boolean(stripe && publishable);

  if (request.method === "GET") {
    response.status(200).json({
      enabled,
      publishableKey: enabled ? publishable : "",
      livemode: publishable.startsWith("pk_live_"),
      currency: "usd",
      presets: PRESETS,
      min: MIN_CENTS,
      max: MAX_CENTS,
    });
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "method_not_allowed" });
    return;
  }

  if (!enabled) {
    response.status(503).json({ error: "donations_unavailable" });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const amount = Math.round(Number(body.amount));

    if (!Number.isFinite(amount) || amount < MIN_CENTS || amount > MAX_CENTS) {
      response.status(400).json({ error: "invalid_amount", min: MIN_CENTS, max: MAX_CENTS });
      return;
    }

    // No statement_descriptor_suffix: Stripe rejects one unless the account has
    // a descriptor prefix configured, and a first live donation is the wrong
    // place to find that out. The description carries the context instead.
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      description: "Donation to Starlight Vanta",
      automatic_payment_methods: { enabled: true },
      metadata: { product: "starlight-vanta", kind: "donation" },
    });

    response.status(200).json({ clientSecret: intent.client_secret, amount });
  } catch (error) {
    console.error("donate", error);
    response.status(500).json({ error: "stripe_error" });
  }
}
