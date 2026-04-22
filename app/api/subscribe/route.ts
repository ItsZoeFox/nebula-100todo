import Redis from "ioredis";
const kv = new Redis(process.env.REDIS_URL!);
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json();
    await kv.set("push_sub", JSON.stringify(sub));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
