import { NextRequest, NextResponse } from "next/server";

const ZOOP = process.env.ZOOP_URL ?? "http://localhost:3001";

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const zoopPath = path.join("/");
  const target = `${ZOOP}/api/${zoopPath}${req.nextUrl.search}`;

  const headers: Record<string, string> = {};
  const cookie = req.headers.get("cookie");
  if (cookie) headers["cookie"] = cookie;
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  let res: Response;
  try {
    res = await fetch(target, { method: req.method, headers, body });
  } catch {
    return NextResponse.json({ error: "Zoop service unavailable" }, { status: 503 });
  }

  const out = new NextResponse(res.body, { status: res.status });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) out.headers.set("set-cookie", setCookie);
  const resType = res.headers.get("content-type");
  if (resType) out.headers.set("content-type", resType);
  return out;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
