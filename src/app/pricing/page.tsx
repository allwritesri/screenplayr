"use client";

import { useState } from "react";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    period: "",
    features: [
      "3 free conversions",
      "Up to 2-minute videos",
      "Standard screenplay format",
      "Download as TXT",
    ],
    cta: "Get Started",
    href: "/convert",
    highlighted: false,
  },
  {
    key: "starter",
    name: "Starter",
    price: 9,
    period: "/month",
    features: [
      "25 conversions/month",
      "Up to 2-minute videos",
      "Professional screenplay format",
      "Download as TXT & PDF",
      "Email support",
    ],
    cta: "Subscribe",
    highlighted: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 29,
    period: "/month",
    features: [
      "100 conversions/month",
      "Up to 2-minute videos",
      "Professional screenplay format",
      "Download as TXT & PDF",
      "Priority support",
      "Batch processing",
    ],
    cta: "Subscribe",
    highlighted: true,
  },
  {
    key: "unlimited",
    name: "Unlimited",
    price: 79,
    period: "/month",
    features: [
      "Unlimited conversions",
      "Up to 2-minute videos",
      "Professional screenplay format",
      "All export formats",
      "Priority support",
      "API access",
      "Batch processing",
    ],
    cta: "Subscribe",
    highlighted: false,
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(plan: string) {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch {
      alert("Failed to connect. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
          Start free with 3 conversions. Upgrade when you need more.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-12">
        <label htmlFor="pricing-email" className="block text-sm font-medium mb-1 text-center">
          Enter your email to subscribe
        </label>
        <input
          id="pricing-email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-white placeholder:text-[var(--muted)] text-center"
        />
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`rounded-xl p-6 flex flex-col ${
              plan.highlighted
                ? "bg-[var(--primary)]/10 border-2 border-[var(--primary)] relative"
                : "bg-[var(--card)] border border-[var(--border)]"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-black text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </span>
            )}

            <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-[var(--muted)]">{plan.period}</span>
            </div>

            <ul className="space-y-2 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-[var(--muted)]"
                >
                  <span className="text-[var(--primary)] mt-0.5">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>

            {plan.href ? (
              <a
                href={plan.href}
                className="block text-center border border-[var(--border)] hover:border-[var(--muted)] px-4 py-2.5 rounded-lg transition font-medium"
              >
                {plan.cta}
              </a>
            ) : (
              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading === plan.key}
                className={`w-full px-4 py-2.5 rounded-lg transition font-medium ${
                  plan.highlighted
                    ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black"
                    : "border border-[var(--border)] hover:border-[var(--muted)]"
                } disabled:opacity-50`}
              >
                {loading === plan.key ? "Loading..." : plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
