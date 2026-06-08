export const metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <span className="eyebrow">Privacy</span>
      <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3rem)", marginTop: "1rem" }}>Your words are yours.</h1>
      <div style={{ marginTop: "1.4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <p>MyAIDiary stores your journal entries privately. Each account can only access its own data.</p>
        <p><strong>AI processing:</strong> when you ask for a summary, mood insight, prompt, or chat, the relevant text is sent to our AI provider (Google Gemini) to generate a response. We don&apos;t sell your data.</p>
        <p><strong>Your control:</strong> you can export all your data or delete your account and entries at any time from settings.</p>
        <p className="muted">Questions? Email rahul@loopwar.dev.</p>
      </div>
    </div>
  );
}
