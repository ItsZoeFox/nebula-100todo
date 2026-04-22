import { Redis } from "@upstash/redis";
const kv = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
import webpush from "web-push";
import { NextRequest, NextResponse } from "next/server";

function initVapid() {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

const MORNING_MSGS = [
  "早安 ✦ 今天的星正在等你点亮",
  "新的一天，打开星云，挑一颗今天要攻克的星",
  "⭐ 今日目标已就绪，去看看吧",
];

const EVENING_MSGS = [
  "今天有没有进展？打开星云记录一下 ✦",
  "晚安前，花2分钟记录今天的目标进展",
  "✦ 今日复盘时间到 — 你的星云等你记录",
];

async function sendPush(title: string, body: string) {
  initVapid();
  const raw = await kv.get<string>("push_sub");
  if (!raw) return { ok: false, reason: "no subscription" };

  const sub = typeof raw === "string" ? JSON.parse(raw) : raw;
  await webpush.sendNotification(sub, JSON.stringify({ title, body, url: "/" }));
  return { ok: true };
}

// GET /api/cron?type=morning|evening  (called by Vercel Cron)
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") ?? "morning";
  const msgs = type === "evening" ? EVENING_MSGS : MORNING_MSGS;
  const body = msgs[new Date().getDate() % msgs.length];
  const title = type === "evening" ? "NEBULA · 今日复盘 🌙" : "NEBULA · 今日目标 ✦";

  const result = await sendPush(title, body);
  return NextResponse.json(result);
}
