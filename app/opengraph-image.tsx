import { ImageResponse } from "next/og";

export const alt = "ACE Exchange — Trade. Create. Connect.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "86px",
        background: "#07111F",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: "8px",
          color: "#22D3EE",
        }}
      >
        ACE EXCHANGE
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 1.02,
          marginTop: 34,
        }}
      >
        <span>Trade.</span>
        <span style={{ color: "#3B82F6" }}>Create.</span>
        <span>Connect.</span>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 26,
          color: "#94A3B8",
          marginTop: 36,
        }}
      >
        Digital assets · Wallet · Card · Creator · AI · Community · Governance
      </div>
    </div>,
    size,
  );
}
