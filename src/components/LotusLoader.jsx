export default function LotusLoader({ progress = .15, label }) {
  return <div className="lotus-loader" role="status" aria-label={label}>
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle className="loader-ring" cx="40" cy="40" r="34" stroke="currentColor" strokeDasharray="1 5" strokeLinecap="round" /><g className="loader-bloom" stroke="currentColor" strokeWidth="1.2"><path d="M40 51C26 42 29 29 40 18c11 11 14 24 0 33ZM40 51C19 51 15 37 17 28c14 1 22 10 23 23ZM40 51c21 0 25-14 23-23-14 1-22 10-23 23ZM21 56c12-3 26-3 38 0" /></g></svg>
    {label && <span>{label}</span>}
    <span className="loader-progress" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress))})` }} /></span>
  </div>;
}
