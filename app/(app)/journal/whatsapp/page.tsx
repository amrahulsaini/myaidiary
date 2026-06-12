"use client";
import { useEffect, useState, useCallback } from "react";
import { MessageCircle, Wifi, WifiOff, RefreshCw, LogIn, UserPlus, Loader2, ChevronRight } from "lucide-react";

type AuthState = { authed: boolean; email: string } | null;
type Status = { connection: "open" | "qr" | "connecting"; qr: string; me: string; mode: string } | null;
type Contact = { jid: string; name: string; auto_reply: number; is_group: number; last_message_at: number };

export default function WhatsAppPage() {
  const [auth, setAuth] = useState<AuthState>(null);
  const [status, setStatus] = useState<Status>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"login" | "signup" | "dashboard">("login");

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    const [me, s] = await Promise.all([
      fetch("/api/zoop/me").then((r) => r.json()),
      fetch("/api/zoop/status").then((r) => r.json()).catch(() => null),
    ]);
    setAuth(me);
    setStatus(s);
    if (me.authed && s?.connection === "open") {
      const c = await fetch("/api/zoop/contacts").then((r) => r.json()).catch(() => []);
      setContacts(Array.isArray(c) ? c.filter((x: Contact) => !x.is_group).slice(0, 20) : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function submit(mode: "login" | "signup") {
    setFormError("");
    setFormLoading(true);
    const res = await fetch(`/api/zoop/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) { setFormError(data.error || "Something went wrong"); return; }
    await fetchStatus();
  }

  async function relink() {
    await fetch("/api/zoop/relink", { method: "POST" });
    setStatus(null);
    setTimeout(fetchStatus, 1000);
  }

  if (loading) return (
    <div className="container section" style={{ textAlign: "center", paddingTop: "4rem" }}>
      <Loader2 size={32} className="spin" style={{ color: "var(--stone)", margin: "0 auto" }} />
      <p className="muted" style={{ marginTop: "1rem" }}>Connecting to Zoop…</p>
    </div>
  );

  // Not logged into Zoop — show auth form
  if (!auth?.authed) return (
    <div className="container section" style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>WhatsApp</h1>
        <p className="muted" style={{ marginTop: ".5rem" }}>Connect your WhatsApp to journal via Zoop AI.</p>
      </div>

      <div className="flex" style={{ gap: ".5rem", marginBottom: "1.5rem" }}>
        {(["login", "signup"] as const).map((m) => (
          <button key={m} onClick={() => setView(m)}
            className={`btn btn-sm${view === m ? "" : " btn-outline"}`}
            style={{ flex: 1 }}>
            {m === "login" ? <><LogIn size={14} /> Sign in</> : <><UserPlus size={14} /> Create account</>}
          </button>
        ))}
      </div>

      <div className="card card-pad">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="label">Email</label>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && submit(view === "login" ? "login" : "signup")} />
          </div>
          {formError && <p style={{ color: "#c0392b", fontSize: ".85rem" }}>{formError}</p>}
          <button className="btn" style={{ width: "100%" }} disabled={formLoading} onClick={() => submit(view === "login" ? "login" : "signup")}>
            {formLoading ? <Loader2 size={16} className="spin" /> : view === "login" ? "Sign in to Zoop" : "Create Zoop account"}
          </button>
        </div>
      </div>
    </div>
  );

  // Logged in — show connection status
  return (
    <div className="container section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>WhatsApp</h1>
          <p className="muted" style={{ marginTop: ".35rem", fontSize: ".85rem" }}>{auth.email}</p>
        </div>
        <button onClick={fetchStatus} className="btn btn-sm btn-outline" title="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Connection state */}
      {status?.connection === "open" && (
        <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", background: "var(--cream)" }}>
          <span style={{ width: 42, height: 42, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wifi size={20} color="#fff" />
          </span>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, textTransform: "uppercase", fontSize: ".9rem" }}>Connected</div>
            <div className="muted" style={{ fontSize: ".8rem" }}>{status.me?.split("@")[0] || "WhatsApp active"}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span className="chip" style={{ fontSize: ".7rem" }}>{status.mode}</span>
          </div>
        </div>
      )}

      {(status?.connection === "qr" || status?.connection === "connecting") && (
        <div className="card card-pad" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", justifyContent: "center", marginBottom: "1rem" }}>
            <WifiOff size={18} color="var(--stone)" />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, textTransform: "uppercase", fontSize: ".85rem" }}>
              {status?.connection === "qr" ? "Scan QR to connect" : "Waiting for QR…"}
            </span>
          </div>
          {status?.qr && (
            <img src={status.qr} alt="WhatsApp QR code" style={{ width: 220, height: 220, margin: "0 auto", display: "block", border: "1px solid var(--ink)", padding: 8, background: "#fff" }} />
          )}
          <p className="muted" style={{ marginTop: "1rem", fontSize: ".82rem" }}>Open WhatsApp → Settings → Linked devices → Link a device</p>
          <button onClick={relink} className="btn btn-sm btn-outline" style={{ marginTop: "1rem" }}>
            <RefreshCw size={13} /> Generate new QR
          </button>
        </div>
      )}

      {/* Contacts / chats */}
      {status?.connection === "open" && contacts.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, textTransform: "uppercase", fontSize: "1rem", marginBottom: "1rem" }}>Recent contacts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {contacts.map((c) => (
              <div key={c.jid} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: ".9rem 0", borderBottom: "1px solid var(--border)", cursor: "default" }}>
                <span style={{ width: 38, height: 38, background: "var(--sand)", border: "1px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MessageCircle size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: ".9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.name || c.jid.split("@")[0]}
                  </div>
                  <div className="muted" style={{ fontSize: ".75rem" }}>
                    {c.auto_reply ? "Auto-reply on" : "Auto-reply off"}
                  </div>
                </div>
                <ChevronRight size={14} color="var(--stone)" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open full dashboard link */}
      <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
        <p className="muted" style={{ fontSize: ".82rem", marginBottom: ".75rem" }}>For full features — contacts, approvals, persona, voice notes, agent commands:</p>
        <a href={process.env.NEXT_PUBLIC_ZOOP_DASHBOARD || "#"} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
          Open Zoop dashboard ↗
        </a>
      </div>
    </div>
  );
}
