"use client";

import Link from "next/link";
import { Heart, RefreshCw } from "lucide-react";

export default function GlobalError({ reset }) {
  return (
    <main className="status-page">
      <section className="status-card" role="alert">
        <span className="status-monogram">J <i>&amp;</i> P</span>
        <p className="status-names">Janith &amp; Pradeepa</p>
        <Heart size={17} fill="currentColor" aria-hidden="true" />
        <p className="section-kicker">A brief pause</p>
        <h1>Something went wrong</h1>
        <p>We could not open this part of the invitation just now. Please try once more.</p>
        <div className="status-actions">
          <button type="button" className="primary-button" onClick={reset}><RefreshCw size={17} />Try Again</button>
          <Link className="secondary-button" href="/">Choose an Invitation</Link>
        </div>
      </section>
    </main>
  );
}
