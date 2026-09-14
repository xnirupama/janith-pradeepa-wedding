import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <main className="root-page">
      <div className="root-glow root-glow-one" />
      <div className="root-glow root-glow-two" />
      <section className="root-content">
        <p className="root-blessing">SRI SUBHA MANGALAM!</p>
        <p className="root-sinhala" lang="si">ශ්‍රී සුභ මංගලම්!</p>
        <Heart className="root-heart" size={16} fill="currentColor" />
        <h1>Janith &amp; Pradeepa</h1>
        <p className="root-intro">We warmly invite you to celebrate two beautiful moments in our journey.</p>
        <div className="invitation-links">
          <Link href="/wedding" className="invitation-link wedding-link">
            <span className="link-number">01</span>
            <div><span>The Wedding</span><strong>Wedding Invitation</strong><time dateTime="2026-11-26">26 November 2026</time></div>
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link href="/homecoming" className="invitation-link homecoming-link">
            <span className="link-number">02</span>
            <div><span>Welcome Home</span><strong>Homecoming Celebration</strong><time dateTime="2026-11-30">30 November 2026</time></div>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
