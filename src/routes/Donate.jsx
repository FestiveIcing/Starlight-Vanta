import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import Seo from "../components/Seo";
import GlassPanel from "../components/GlassPanel";
import { cn } from "../lib/utils";

const APPEARANCE = {
  theme: "night",
  variables: {
    colorPrimary: "#7c3aed",
    colorBackground: "#0b0b0f",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.45)",
    colorDanger: "#f87171",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "10px",
    spacingUnit: "4px",
  },
};

function money(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function PaymentForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/donate` },
    });

    if (error) setMessage(error.message || "That payment could not be completed.");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <PaymentElement options={{ layout: "tabs" }} />
      {message && <p className="text-xs text-red-300">{message}</p>}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
      >
        <Lock className="h-3.5 w-3.5" />
        {busy ? "Processing…" : `Donate ${money(amount)}`}
      </button>
      <p className="text-center text-[11px] leading-relaxed text-white/30">
        Card details are entered inside Stripe's own iframe and are never seen by this site or by
        Starlight Solutions, Inc.
      </p>
    </form>
  );
}

export default function Donate() {
  const [params] = useSearchParams();
  const [config, setConfig] = useState(null);
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const stripePromise = useMemo(
    () => (config?.publishableKey ? loadStripe(config.publishableKey) : null),
    [config?.publishableKey]
  );

  useEffect(() => {
    fetch("/api/donate")
      .then((res) => res.json())
      .then(setConfig)
      .catch(() => setConfig({ enabled: false }));
  }, []);

  // Stripe sends the visitor back here with the intent appended to the URL.
  useEffect(() => {
    const secret = params.get("payment_intent_client_secret");
    if (!secret || !stripePromise) return;
    stripePromise.then((stripe) =>
      stripe?.retrievePaymentIntent(secret).then(({ paymentIntent }) => {
        setStatus(paymentIntent?.status || "");
      })
    );
  }, [params, stripePromise]);

  async function start() {
    setError("");
    const cents = custom ? Math.round(Number(custom) * 100) : amount;
    if (!Number.isFinite(cents) || cents < (config?.min ?? 200) || cents > (config?.max ?? 50000)) {
      setError(`Pick an amount between ${money(config?.min ?? 200)} and ${money(config?.max ?? 50000)}.`);
      return;
    }
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: cents }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setAmount(cents);
      setClientSecret(data.clientSecret);
    } catch {
      setError("Could not start the payment. Try again in a moment.");
    }
  }

  if (status === "succeeded") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-20 text-center">
        <Seo path="/donate" />
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <Check className="h-5 w-5 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-semibold text-white">Thank you.</h1>
        <p className="text-sm leading-relaxed text-white/50">
          The receipt is on its way from Stripe. Nothing about the payment is stored on this site.
        </p>
        <Link to="/generator" className="rounded-full bg-violet-600 px-5 py-2.5 text-sm text-white hover:bg-violet-500">
          Back to the generator
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <Seo path="/donate" />

      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Donate</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
          Vanta has no accounts, no advertising and nothing to upsell. If it found you a name you
          kept, a one-off contribution covers the hosting bill for the month.
        </p>
      </header>

      {config && !config.enabled && (
        <GlassPanel className="p-6">
          <p className="text-sm text-white/70">Donations are temporarily unavailable.</p>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            The payment processor is not configured on this deployment yet. Nothing is wrong with
            your browser — please check back shortly.
          </p>
        </GlassPanel>
      )}

      {config?.enabled && !clientSecret && (
        <GlassPanel className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] uppercase tracking-widest text-white/40">Amount</p>
            <div className="flex flex-wrap gap-2">
              {config.presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setCustom("");
                  }}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm transition-colors",
                    !custom && amount === preset
                      ? "border-violet-400/50 bg-violet-500/15 text-violet-100"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                  )}
                >
                  {money(preset)}
                </button>
              ))}
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3">
                <span className="text-sm text-white/35">$</span>
                <input
                  value={custom}
                  onChange={(event) => setCustom(event.target.value.replace(/[^0-9.]/g, "").slice(0, 6))}
                  placeholder="other"
                  inputMode="decimal"
                  aria-label="Custom amount in US dollars"
                  className="w-20 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="button"
            onClick={start}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Continue
          </button>

          <p className="text-[11px] leading-relaxed text-white/30">
            Payments are handled by Stripe. Donations are voluntary contributions to Starlight
            Solutions, Inc., not a purchase, and they are not tax deductible or refundable except
            where the law requires it.
          </p>
        </GlassPanel>
      )}

      {config?.enabled && clientSecret && stripePromise && (
        <GlassPanel className="flex flex-col gap-6 p-6">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] uppercase tracking-widest text-white/40">Payment details</p>
            <button
              type="button"
              onClick={() => setClientSecret("")}
              className="text-[11px] text-white/35 hover:text-white"
            >
              change amount
            </button>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: APPEARANCE }}>
            <PaymentForm amount={amount} />
          </Elements>
        </GlassPanel>
      )}

      {status && status !== "succeeded" && (
        <p className="text-xs text-white/45">Payment status: {status.replace(/_/g, " ")}.</p>
      )}
    </div>
  );
}
