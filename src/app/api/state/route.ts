// GET /api/state?uid=...  → everything one user's app needs (apps, requests, votes, My apps, notifications)
// If the person is signed in with Google, the server picks their account (the uid sent is only a guest id).
import { NextResponse } from "next/server";
import { authEnabled, currentGoogleAccount } from "@/auth";
import { hasDatabase, loadState, resolveUid, SignedOutError } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!hasDatabase) return NextResponse.json({ error: "no database configured" }, { status: 503 });
  const clientUid = new URL(req.url).searchParams.get("uid") ?? "";
  if (!/^u_[a-z0-9]{8,34}$/.test(clientUid)) return NextResponse.json({ error: "bad uid" }, { status: 400 });
  try {
    const google = await currentGoogleAccount();
    const uid = await resolveUid(clientUid, google);
    return NextResponse.json({ ...(await loadState(uid, google)), authEnabled });
  } catch (e) {
    if (e instanceof SignedOutError) return NextResponse.json({ error: "signed out" }, { status: 409 });
    console.error("loadState failed", e);
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }
}
