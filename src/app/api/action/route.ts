// POST /api/action  { uid, action: { type: "toggleUpvote", requestId: "..." } }
// One endpoint for every button that changes data. See runAction in src/lib/db.ts.
import { NextResponse } from "next/server";
import { currentGoogleAccount } from "@/auth";
import { hasDatabase, ProfileRequiredError, resolveUid, runAction, SignedOutError, type Action } from "@/lib/db";

export async function POST(req: Request) {
  if (!hasDatabase) return NextResponse.json({ error: "no database configured" }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { uid?: string; action?: Action } | null;
  if (!body?.uid || !/^u_[a-z0-9]{8,34}$/.test(body.uid) || !body.action?.type) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const uid = await resolveUid(body.uid, await currentGoogleAccount());
    await runAction(uid, body.action);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ProfileRequiredError) return NextResponse.json({ error: "create a profile first" }, { status: 403 });
    if (e instanceof SignedOutError) return NextResponse.json({ error: "signed out" }, { status: 409 });
    console.error("action failed", body.action.type, e);
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }
}
