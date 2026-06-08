import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: "1px solid var(--ink)", background: "var(--sand)" }}>
      <div className="container" style={{ paddingBlock: "2.5rem" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between" style={{ gap: "1.5rem" }}>
          <div>
            <img src="/myaidiary-fulllogo.png" alt="MyAIDiary" style={{ height: 38, width: "auto", mixBlendMode: "multiply" }} />
            <p className="muted" style={{ marginTop: ".5rem", maxWidth: "36ch" }}>
              A private, AI-powered journal. Write your day — reflect with a little help from AI.
            </p>
          </div>
          <nav className="flex flex-wrap items-center" style={{ gap: "1.2rem" }}>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/privacy" className="nav-link">Privacy</Link>
            <Link href="/terms" className="nav-link">Terms</Link>
            <Link href="/auth" className="nav-link">Sign in</Link>
          </nav>
        </div>
        <div style={{ marginTop: "1.6rem", paddingTop: "1rem", borderTop: "1px solid var(--ink)", fontSize: ".82rem" }} className="muted">
          © {year} MyAIDiary · Made with care.
        </div>
      </div>
    </footer>
  );
}
