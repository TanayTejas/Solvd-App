// POST /api/action  { uid, action: { type: "toggleUpvote", requestId: "..." } }
// One endpoint for every button that changes data. See runAction in src/lib/db.ts.
import { NextResponse } from "next/server";
import { hasDatabase, runAction, type Action } from "@/lib/db";

export async function POST(req: Request) {
  if (!hasDatabase) return NextResponse.json({ error: "no database configured" }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { uid?: string; action?: Action } | null;
  if (!body?.uid || !/^u_[a-z0-9]{8,32}$/.test(body.uid) || !body.action?.type) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    await runAction(body.uid, body.action);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("action failed", body.action.type, e);
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }
}
