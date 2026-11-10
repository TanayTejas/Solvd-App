"use client";
// First visit: send people to "Create your profile" (or Browse as guest) before anything else.
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function ProfileGate() {
  const { ready, profile, guest } = useStore();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const open = ["/", "/welcome", "/privacy"].includes(path);
    if (ready && !profile.complete && !guest && !open) router.replace("/welcome");
  }, [ready, profile.complete, guest, path, router]);
  return null;
}
