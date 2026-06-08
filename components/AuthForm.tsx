"use client";

import { useActionState, useState } from "react";
import { authenticate, googleLogin, type AuthState } from "@/app/actions/auth";

export default function AuthForm({ initialMode, googleEnabled }: { initialMode: "login" | "signup"; googleEnabled: boolean }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [state, formAction, pending] = useActionState<AuthState, FormData>(authenticate, {});
  const isSignup = mode === "signup";

  return (
    <div className="container section" style={{ maxWidth: 460 }}>
      <div className="card card-pad">
        <h1 className="section-title" style={{ fontSize: "2rem" }}>{isSignup ? "Start journaling" : "Welcome back"}</h1>
        <p className="muted" style={{ marginTop: ".4rem" }}>
          {isSignup ? "Create your private AI journal." : "Sign in to your journal."}
        </p>

        {googleEnabled && (
          <form action={googleLogin} style={{ marginTop: "1.4rem" }}>
            <button type="submit" className="btn btn-outline" style={{ width: "100%" }}>Continue with Google</button>
          </form>
        )}
        {googleEnabled && (
          <div className="flex items-center" style={{ gap: ".75rem", margin: "1.1rem 0", color: "var(--muted)", fontSize: ".8rem" }}>
            <span style={{ flex: 1, height: 1, background: "var(--ink)" }} /> OR <span style={{ flex: 1, height: 1, background: "var(--ink)" }} />
          </div>
        )}

        <form action={formAction} className="flex flex-col" style={{ gap: "1rem", marginTop: googleEnabled ? 0 : "1.4rem" }}>
          <input type="hidden" name="mode" value={mode} />
          {isSignup && (
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input className="field" id="name" name="name" autoComplete="name" placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input className="field" id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input className="field" id="password" name="password" type="password" required minLength={6}
                   autoComplete={isSignup ? "new-password" : "current-password"} placeholder="••••••••" />
          </div>

          {state?.error && (
            <p style={{ border: "1px solid var(--ink)", background: "#f8d7d2", padding: ".5rem .7rem", fontSize: ".85rem" }}>{state.error}</p>
          )}

          <button type="submit" className="btn" style={{ width: "100%" }} disabled={pending}>
            {pending ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: "1.1rem", fontSize: ".88rem", textAlign: "center" }}>
          {isSignup ? "Already have an account? " : "New to MyAIDiary? "}
          <button type="button" onClick={() => setMode(isSignup ? "login" : "signup")}
                  style={{ textDecoration: "underline", fontWeight: 700 }}>
            {isSignup ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
