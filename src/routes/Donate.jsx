import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import Seo from "../components/Seo";
import { generate } from "../lib/engine";
import { useVanta } from "../state/VantaContext";
import { cn } from "../lib/utils";

const APPEARANCE = {
  theme: "night",
  variables: {
    colorPrimary: "#8b5cf6",
    colorBackground: "#0b0b11",
    colorText: "#f5f3ff",
    colorTextSecondary: "rgba(255,255,255,0.45)",
    colorTextPlaceholder: "rgba(255,255,255,0.25)",
    colorDanger: "#fb7185",
    colorIcon: "rgba(196,181,253,0.8)",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSizeBase: "15px",
    borderRadius: "12px",
    spacingUnit: "4px",
    spacingGridRow: "18px",
  },
  rules: {
    ".Input": {
      backgroundColor: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "none",
      padding: "12px 14px",
      transition: "border-color .2s ease, background-color .2s ease",
    },
    ".Input:hover": { borderColor: "rgba(255,255,255,0.18)" },
    ".Input:focus": {
      borderColor: "rgba(167,139,250,0.65)",
      backgroundColor: "rgba(139,92,246,0.06)",
      boxShadow: "0 0 0 3px rgba(139,92,246,0.14)",
    },
    ".Input--invalid": { borderColor: "rgba(251,113,133,0.6)", boxShadow: "none" },
    ".Label": {
      fontSize: "11px",
      fontWeight: "500",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.40)",
      marginBottom: "7px",
    },
    ".Tab": {
      backgroundColor: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.09)",
      boxShadow: "none",
      transition: "all .2s ease",
    },
    ".Tab:hover": { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.16)" },
    ".Tab--selected": {
      backgroundColor: "rgba(139,92,246,0.14)",
      borderColor: "rgba(167,139,250,0.55)",
      boxShadow: "0 0 24px -10px rgba(139,92,246,0.9)",
      color: "#ede9fe",
    },
    ".TabIcon--selected": { fill: "#c4b5fd" },
    ".TabLabel--selected": { color: "#ede9fe" },
    ".Block": {
      backgroundColor: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "none",
    },
    ".CheckboxInput": { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)" },
    ".CheckboxInput--checked": { backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" },
    ".Error": { fontSize: "12px", marginTop: "6px" },
  },
};

function money(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

/* A quiet wall of generated names behind the panel — the thing being paid for. */
function NameWall() {
  const names = useMemo(() => generate({ style: "aesthetic", minLength: 4, maxLength: 9 }, 40), []);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden rounded-3xl"
      style={{
        maskImage: "radial-gradient(120% 90% at 50% 0%, #000 5%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(120% 90% at 50% 0%, #000 5%, transparent 72%)",
      }}
    >
      <div className="flex flex-wrap gap-x-5 gap-y-2 p-6 font-mono text-sm leading-relaxed text-white/[0.055]">
        {names.map((item) => (
          <span key={item.name}>{item.name}</span>
        ))}
      </div>
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <div className={cn("relative rounded-3xl p-[1px]", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl opacity-70"
        style={{
          background:
            "linear-gradient(160deg, rgba(167,139,250,0.45) 0%, rgba(255,255,255,0.06) 32%, rgba(255,255,255,0.03) 68%, rgba(236,72,153,0.22) 100%)",
        }}
      />
      <div className="relative rounded-[calc(1.5rem-1px)] bg-[#0a0a0f]/95 backdrop-blur-xl">{children}</div>
    </div>
  );
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
    <form onSubmit={submit} className="flex flex-col gap-6">
      <PaymentElement options={{ layout: "tabs" }} />
      {message && (
        <p className="rounded-lg border border-red-400/25 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="group relative overflow-hidden rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-12px_rgba(139,92,246,0.9)] transition-all duration-300 hover:bg-violet-500 disabled:opacity-60"
      >
        <span className="relative flex items-center justify-center gap-2">
          <Lock className="h-3.5 w-3.5" />
          {busy ? "Processing…" : `Donate ${money(amount)}`}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      </button>
    </form>
  );
}

export default function Donate() {
  const [params] = useSearchParams();
  const { reduceMotion } = useVanta();
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

  const chosen = custom ? Math.round(Number(custom) * 100) || 0 : amount;

  useEffect(() => {
    fetch("/api/donate")
      .then((res) => res.json())
      .then(setConfig)
      .catch(() => setConfig({ enabled: false }));
  }, []);

  useEffect(() => {
    const secret = params.get("payment_intent_client_secret");
    if (!secret || !stripePromise) return;
    stripePromise.then((stripe) =>
      stripe?.retrievePaymentIntent(secret).then(({ paymentIntent }) => setStatus(paymentIntent?.status || ""))
    );
  }, [params, stripePromise]);

  async function start() {
    setError("");
    if (!Number.isFinite(chosen) || chosen < (config?.min ?? 200) || chosen > (config?.max ?? 50000)) {
      setError(`Pick an amount between ${money(config?.min ?? 200)} and ${money(config?.max ?? 50000)}.`);
      return;
    }
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: chosen }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setAmount(chosen);
      setClientSecret(data.clientSecret);
    } catch {
      setError("Could not start the payment. Try again in a moment.");
    }
  }

  if (status === "succeeded") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-24 text-center">
        <Seo path="/donate" />
        <motion.div
          initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.8)]"
        >
          <Check className="h-6 w-6 text-emerald-300" />
        </motion.div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Thank you.</h1>
        <p className="max-w-sm text-sm leading-relaxed text-white/50">
          The receipt is on its way from Stripe. Nothing about the payment is stored on this site.
        </p>
        <Link
          to="/generator"
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm text-white transition-colors hover:bg-violet-500"
        >
          Back to the generator
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <Seo path="/donate" />

      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-200/80">
          <Sparkles className="h-3 w-3" /> Pay what it's worth to you
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Donate</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55">
          Vanta has no accounts, no advertising and nothing to upsell. If it found you a name you
          kept, a one-off contribution covers the hosting.
        </p>
      </header>

      {config && !config.enabled && (
        <Panel>
          <div className="p-7">
            <p className="text-sm text-white/70">Donations are temporarily unavailable.</p>
            <p className="mt-2 text-xs leading-relaxed text-white/40">
              The payment processor is not configured on this deployment yet. Nothing is wrong with
              your browser — please check back shortly.
            </p>
          </div>
        </Panel>
      )}

      {config?.enabled && !clientSecret && (
        <div className="relative">
          <NameWall />
          <Panel>
            <div className="flex flex-col gap-7 p-7 sm:p-9">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Your contribution</p>
                <motion.p
                  key={chosen}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 font-mono text-5xl tabular-nums text-white sm:text-6xl"
                >
                  {chosen > 0 ? money(chosen) : "—"}
                </motion.p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {config.presets.map((preset) => {
                  const active = !custom && amount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset);
                        setCustom("");
                      }}
                      className={cn(
                        "relative rounded-xl border py-3 text-sm transition-colors duration-200",
                        active
                          ? "border-violet-400/50 text-white"
                          : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="amount-pill"
                          className="absolute inset-0 -z-10 rounded-xl bg-violet-500/15 shadow-[0_0_30px_-10px_rgba(139,92,246,0.9)]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      {money(preset)}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 transition-colors focus-within:border-violet-400/45">
                <span className="text-sm text-white/30">$</span>
                <input
                  value={custom}
                  onChange={(event) => setCustom(event.target.value.replace(/[^0-9.]/g, "").slice(0, 6))}
                  placeholder="another amount"
                  inputMode="decimal"
                  aria-label="Custom amount in US dollars"
                  className="w-full bg-transparent py-3 font-mono text-sm text-white outline-none placeholder:font-sans placeholder:text-white/25"
                />
              </div>

              {error && <p className="text-xs text-red-300">{error}</p>}

              <button
                type="button"
                onClick={start}
                className="group relative overflow-hidden rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-12px_rgba(139,92,246,0.9)] transition-all duration-300 hover:bg-violet-500"
              >
                <span className="relative">Continue</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
              </button>

              <div className="grid gap-3 border-t border-white/[0.07] pt-6 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, text: "Processed by Stripe" },
                  { icon: Lock, text: "Card never touches this site" },
                  { icon: Sparkles, text: "No account, no follow-up" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-[11px] text-white/35">
                    <item.icon className="h-3.5 w-3.5 shrink-0 text-violet-300/60" />
                    {item.text}
                  </div>
                ))}
              </div>

              <p className="text-[11px] leading-relaxed text-white/25">
                Donations are voluntary contributions to Starlight Solutions, Inc., not a purchase,
                and they are not tax deductible or refundable except where the law requires it. See{" "}
                <Link to="/terms" className="underline underline-offset-2 hover:text-white/50">
                  Terms
                </Link>
                .
              </p>
            </div>
          </Panel>
        </div>
      )}

      {config?.enabled && clientSecret && stripePromise && (
        <Panel>
          <div className="flex flex-col gap-7 p-7 sm:p-9">
            <div className="flex items-baseline justify-between border-b border-white/[0.07] pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Paying</p>
                <p className="mt-1 font-mono text-2xl tabular-nums text-white">{money(amount)}</p>
              </div>
              <button
                type="button"
                onClick={() => setClientSecret("")}
                className="text-[11px] text-white/35 underline underline-offset-4 transition-colors hover:text-white"
              >
                change amount
              </button>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret, appearance: APPEARANCE }}>
              <PaymentForm amount={amount} />
            </Elements>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-white/25">
              <Lock className="h-3 w-3" />
              Card details are entered inside Stripe's own frame and are never seen by this site.
            </p>
          </div>
        </Panel>
      )}

      {status && status !== "succeeded" && (
        <p className="text-center text-xs text-white/45">
          Payment status: {status.replace(/_/g, " ")}.
        </p>
      )}
    </div>
  );
}
