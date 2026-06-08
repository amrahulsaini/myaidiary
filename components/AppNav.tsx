import Link from "next/link";
import { PenLine, BookOpen, LineChart } from "lucide-react";

export default function AppNav() {
  return (
    <div style={{ borderBottom: "1px solid var(--ink)", background: "var(--sand)" }}>
      <div className="container flex items-center justify-between" style={{ height: 52 }}>
        <nav className="flex items-center" style={{ gap: "1.4rem" }}>
          <Link href="/journal" className="nav-link"><span className="inline-flex items-center" style={{ gap: ".35rem" }}><BookOpen size={15} /> Journal</span></Link>
          <Link href="/insights" className="nav-link"><span className="inline-flex items-center" style={{ gap: ".35rem" }}><LineChart size={15} /> Insights</span></Link>
        </nav>
        <Link href="/journal/new" className="btn btn-sm"><PenLine size={15} /> New</Link>
      </div>
    </div>
  );
}
