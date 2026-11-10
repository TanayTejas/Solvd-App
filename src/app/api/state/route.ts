// GET /api/state?uid=...  → everything one user's app needs (apps, requests, votes, My apps, notifications)
import { NextResponse } from "next/server";
import { hasDatabase, loadState } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!hasDatabase) return NextResponse.json({ error: "no database configured" }, { status: 503 });
  const uid = new URL(req.url).searchParams.get("uid") ?? "";
  if (!/^u_[a-z0-9]{8,32}$/.test(uid)) return NextResponse.json({ error: "bad uid" }, { status: 400 });
  try {
    return NextResponse.json(await loadState(uid));
  } catch (e) {
    console.error("loadState failed", e);
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }
}
