import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="root-page">
      <div className="root-glow root-glow-one" />
      <div className="root-glow root-glow-two" />
      <section className="root-content">
        <span className="root-monogram" aria-hidden="true">J <i>&amp;</i> P</span>
        <p className="root-blessing">SRI SUBHA MANGALAM!</p>
        <p className="root-sinhala" lang="si">ශ්‍රී සුභ මංගලම්!</p>
        <Heart className="root-heart" size={15} fill="currentColor" />
        <h1>Choose a Celebration</h1>
        <p className="root-couple">Janith &amp; Pradeepa</p>
        <p className="root-intro">Warmly invite you to share in two beautiful moments of their journey.</p>
        <div className="invitation-links">
          <Link href="/wedding" className="invitation-link wedding-link">
            <span className="link-number">01</span>
            <div><span>The Wedding</span><strong>Wedding Invitation</strong><time dateTime="2026-11-26">Thursday · 26 November 2026</time><em>Hemandra Grand Hotel</em></div>
            <span className="root-card-action">Open Wedding Invitation <ArrowRight size={16} aria-hidden="true" /></span>
          </Link>
          <Link href="/homecoming" className="invitation-link homecoming-link">
            <span className="link-number">02</span>
            <div><span>Welcome Home</span><strong>Homecoming Celebration</strong><time dateTime="2026-11-30">Monday · 30 November 2026</time><em>At the house in Pitigala</em></div>
            <span className="root-card-action">Open Homecoming Invitation <ArrowRight size={16} aria-hidden="true" /></span>
          </Link>
        </div>
        <p className="root-footnote"><Sparkles size={13} aria-hidden="true" /> Select an invitation to begin</p>
      </section>
    </main>
  );
}
