import Link from "next/link";
import Image from "next/image";
import brand from "@/data/brand-assets.json";

export default function NotFound() {
  return (
    <main className="status-page">
      <section className="status-card">
        <span className="status-monogram">J <i>&amp;</i> P</span>
        <p className="status-names">Janith &amp; Pradeepa</p>
        <Image src={brand.wedding.icon.src} alt="" width={64} height={64} style={{ margin: "1rem auto" }} />
        <p className="section-kicker">Invitation not found</p>
        <h1>This page has wandered away</h1>
        <p>The celebration is still waiting for you. Return to the invitation selector to continue.</p>
        <div className="status-actions">
          <Link className="primary-button" href="/">Choose an Invitation</Link>
          <Link className="secondary-button" href="/wedding">Back to the Wedding invitation</Link>
          <Link className="secondary-button" href="/homecoming">Back to the Homecoming invitation</Link>
        </div>
      </section>
    </main>
  );
}
