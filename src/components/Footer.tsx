"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { resetPrototype } = useStore();

  return (
    <footer className="mt-32 border-t border-ink">
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-12 py-12 md:grid-cols-12">
        <div className="col-span-2 md:col-span-4">
          <p className="text-[0.8125rem] font-semibold tracking-[0.22em]">FINEST UNIFORM</p>
          <p className="mt-4 max-w-[22rem] text-sm leading-relaxed text-charcoal">
            The clothes you wear when you don&rsquo;t want to think about clothes. The everyday extension of
            Finest Form, tailors.
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="label mb-4 text-muted">Index</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="ulink" href="/uniforms">Uniforms</Link></li>
            <li><Link className="ulink" href="/build">Build Your Uniform</Link></li>
            <li><Link className="ulink" href="/build/configure">Configurator</Link></li>
            <li><Link className="ulink" href="/archive">Archive</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="label mb-4 text-muted">Service</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="ulink" href="/record">Your Record</Link></li>
            <li><Link className="ulink" href="/issue">Your Issue</Link></li>
            <li><Link className="ulink" href="/record/001-26-00482">Scan a garment</Link></li>
            <li><span className="text-muted">Shipping &amp; returns</span></li>
          </ul>
        </div>

        <form
          className="col-span-2 md:col-span-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes("@")) setSent(true);
          }}
        >
          <p className="label mb-4 text-muted">Issue notices</p>
          <p className="mb-4 text-sm text-charcoal">One letter when a new form is issued. Nothing else.</p>
          {sent ? (
            <p className="label border-b border-ink pb-2">Noted. Next notice: Issue 02 / 11.26</p>
          ) : (
            <div className="flex border-b border-ink">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted"
              />
              <button className="label px-1 transition-opacity hover:opacity-60">Subscribe →</button>
            </div>
          )}
        </form>
      </div>

      <div className="shell grid grid-cols-2 gap-4 border-t rule py-4 label text-muted md:grid-cols-4">
        <span>Form No. FU-000</span>
        <span className="md:text-center">Est. 2026 / Porto — London</span>
        <span className="hidden md:block md:text-center">A Finest Form company</span>
        <button onClick={resetPrototype} className="text-left transition-colors hover:text-ink md:text-right" title="Clears locally stored issue, consultation and record">
          Reset prototype data
        </button>
      </div>
    </footer>
  );
}
