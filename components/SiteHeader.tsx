import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";

export default async function SiteHeader() {
  const session = await auth();
  const signedIn = !!session?.user;

  return (
    <header className="site-header">
      <div className="container flex items-center justify-between" style={{ height: 70 }}>
        <Link href="/" aria-label="MyAIDiary home" className="inline-flex items-center">
          <img
            src="/myaidiary-fulllogo.png"
            alt="MyAIDiary"
            height={40}
            style={{ height: 40, width: "auto", mixBlendMode: "multiply" }}
          />
        </Link>

        <nav className="hidden md:flex items-center" style={{ gap: "1.6rem" }}>
          <Link href="/#features" className="nav-link">Features</Link>
          <Link href="/#how" className="nav-link">How it works</Link>
          <Link href="/about" className="nav-link">About</Link>
        </nav>

        <div className="flex items-center" style={{ gap: ".6rem" }}>
          {signedIn ? (
            <>
              <Link href="/journal" className="btn btn-sm">Open journal</Link>
              <form action={logout}>
                <button type="submit" className="btn btn-sm btn-outline">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth" className="nav-link hidden sm:inline-flex">Sign in</Link>
              <Link href="/auth?mode=signup" className="btn btn-sm">Start journaling</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
