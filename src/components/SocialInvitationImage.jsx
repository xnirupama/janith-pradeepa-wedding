export default function SocialInvitationImage({ theme, blessing, sinhalaBlessing, sinhalaImage, label, date, location }) {
  const wedding = theme === "wedding";
  const palette = wedding
    ? { background: "#f5eddc", panel: "#fffaf0", ink: "#5c2530", accent: "#b88b3f", muted: "#756746" }
    : { background: "#26050f", panel: "#4b0c20", ink: "#fff7e8", accent: "#e0b866", muted: "#edcfbd" };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 42, background: `radial-gradient(circle at 15% 0%, ${wedding ? "#fffdf6" : "#7b1d3b"} 0, transparent 42%), ${palette.background}`, color: palette.ink, fontFamily: "Georgia, serif" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.accent}`, borderRadius: 32, background: palette.panel, boxShadow: "0 24px 80px rgba(0,0,0,.22)", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 14, border: `1px solid ${palette.accent}`, borderRadius: 22, opacity: .45 }} />
        {blessing && <div style={{ display: "flex", color: palette.accent, fontSize: 16, letterSpacing: 5, textTransform: "uppercase" }}>{blessing}</div>}
        {sinhalaBlessing && sinhalaImage && (
          // ImageResponse's default font does not contain Sinhala, so use a tiny local raster line.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sinhalaImage} width="260" height="30" alt={sinhalaBlessing} style={{ display: "flex", width: 260, height: 30, marginTop: 3, objectFit: "contain" }} />
        )}
        <div style={{ display: "flex", marginTop: blessing ? 19 : 0, color: palette.accent, fontSize: 21, letterSpacing: 7, textTransform: "uppercase" }}>Janith &amp; Pradeepa</div>
        <div style={{ display: "flex", marginTop: 22, fontSize: label.length > 20 ? 61 : 70, lineHeight: 1, fontWeight: 500 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 17, marginTop: 28, color: palette.accent }}>
          <span style={{ width: 92, height: 1, background: palette.accent }} />
          <span style={{ fontSize: 25 }}>♥</span>
          <span style={{ width: 92, height: 1, background: palette.accent }} />
        </div>
        <div style={{ display: "flex", marginTop: 23, color: palette.muted, fontSize: 25, letterSpacing: 2 }}>{date}</div>
        <div style={{ display: "flex", marginTop: 12, color: palette.accent, fontSize: 19, letterSpacing: 3, textTransform: "uppercase" }}>{location}</div>
      </div>
    </div>
  );
}
