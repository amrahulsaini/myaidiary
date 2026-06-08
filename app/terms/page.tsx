export const metadata = { title: "Terms" };

export default function Terms() {
  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <span className="eyebrow">Terms</span>
      <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3rem)", marginTop: "1rem" }}>Terms of use.</h1>
      <div style={{ marginTop: "1.4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <p>By using MyAIDiary you agree to use it lawfully and respectfully. The service is provided &quot;as is&quot; while in active development.</p>
        <p>AI-generated summaries and insights are for personal reflection only and are not professional, medical, or mental-health advice.</p>
        <p>You retain ownership of your entries. We may update these terms as the product evolves.</p>
        <p className="muted">Contact: rahul@loopwar.dev.</p>
      </div>
    </div>
  );
}
