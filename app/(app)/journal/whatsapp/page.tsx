"use client";

const ZOOP_URL = process.env.NEXT_PUBLIC_ZOOP_DASHBOARD ?? "http://ly71zwxs1558g0k29r3vlci1.34.131.117.133.sslip.io";

export default function WhatsAppPage() {
  return (
    <div style={{ width: "100%", height: "calc(100vh - 122px)" }}>
      <iframe
        src={ZOOP_URL}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        allow="camera; microphone"
        title="Zoop WhatsApp"
      />
    </div>
  );
}
