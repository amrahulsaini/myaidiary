import { NextRequest, NextResponse } from "next/server";
import { sendMail, EMAIL_FROM, isEmailConfigured } from "@/lib/email";

// GET /api/email/test?token=<EMAIL_TEST_TOKEN>&to=you@example.com
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!process.env.EMAIL_TEST_TOKEN || token !== process.env.EMAIL_TEST_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: false, error: "SMTP not configured" }, { status: 503 });
  }
  const to = req.nextUrl.searchParams.get("to");
  if (!to) return NextResponse.json({ ok: false, error: "missing ?to" }, { status: 400 });

  try {
    const info = await sendMail({
      to,
      subject: "MyAIDiary — email test ✅",
      html: `<p>Hello from <strong>${EMAIL_FROM}</strong> — your MyAIDiary email is working. ✨</p>`,
      text: "Hello from MyAIDiary — your email is working.",
    });
    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
