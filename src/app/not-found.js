import Link from "next/link";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <main className="status-page">
      <section className="status-card">
        <span className="status-monogram">J <i>&amp;</i> P</span>
        <p className="status-names">Janith &amp; Pradeepa</p>
        <Heart size={17} fill="currentColor" aria-hidden="true" />
        <p className="section-kicker">Invitation not found</p>
        <h1>This page has wandered away</h1>
        <p>The celebration is still waiting for you. Return to the invitation selector to continue.</p>
        <div className="status-actions">
          <Link className="primary-button" href="/">Choose an Invitation</Link>
          <Link className="secondary-button" href="/wedding">Wedding</Link>
          <Link className="secondary-button" href="/homecoming">Homecoming</Link>
        </div>
      </section>
    </main>
  );
}
