"use client";
// Bottom sheet shown when a guest tries something that needs a profile.
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, GoogleButton } from "./ui";

export function GuestWall({ reason }: { reason: string }) {
  const { authEnabled, account, signInWithGoogle } = useStore();
  const router = useRouter();
  return (
    <div className="rounded-[20px] bg-violet-tint p-5 text-center">
      <p className="text-4xl">👋</p>
      <p className="mt-2 font-display text-lg font-bold">Create a profile to {reason}</p>
      <p className="mt-1 text-sm text-muted">Guests can search and try apps. A free profile takes 10 seconds.</p>
      <div className="mt-4 space-y-2">
        <Button className="w-full" onClick={() => router.push("/welcome")}>Create profile</Button>
        {authEnabled && !account && <GoogleButton onClick={signInWithGoogle} />}
      </div>
    </div>
  );
}

export default function AccountPrompt() {
  const { accountPrompt, closeAccountPrompt } = useStore();
  if (!accountPrompt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30" onClick={closeAccountPrompt}>
      <div onClick={(e) => { e.stopPropagation(); if ((e.target as HTMLElement).closest("button")) closeAccountPrompt(); }} className="animate-slide-up w-full max-w-[430px] rounded-t-[28px] bg-white p-5 pb-8">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        <GuestWall reason={accountPrompt} />
        <button onClick={closeAccountPrompt} className="mt-3 w-full py-2 text-sm font-semibold text-muted">Keep browsing as guest</button>
      </div>
    </div>
  );
}
