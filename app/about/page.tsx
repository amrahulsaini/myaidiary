export const metadata = { title: "About" };

export default function About() {
  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <span className="eyebrow">About</span>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", marginTop: "1rem" }}>A calmer way to journal.</h1>
      <p className="lead" style={{ marginTop: "1.2rem" }}>
        MyAIDiary is a private, AI-powered journal. Write your day in plain words and let a little
        AI help you reflect — summaries, mood over time, gentle prompts, and the ability to chat with
        your own journal. No noise, no feeds. Just you and your thoughts.
      </p>
      <p style={{ marginTop: "1rem" }} className="muted">
        Built by LoopWar. Your entries are yours — export or delete them anytime.
      </p>
    </div>
  );
}
