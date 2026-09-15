import { ImageResponse } from "next/og";

export function createMonogramIcon(size) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "22%", background: "linear-gradient(145deg, #fbf4e5, #ead5aa)", color: "#7d2030", fontFamily: "Georgia, serif", fontSize: size * .28, fontWeight: 700, boxShadow: `inset 0 0 0 ${Math.max(2, size * .035)}px #b8893c` }}>
      J&amp;P
    </div>,
    { width: size, height: size },
  );
}
