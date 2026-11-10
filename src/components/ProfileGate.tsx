"use client";
// First visit: send people to "Create your profile" before anything else.
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function ProfileGate() {
  const { ready, profile } = useStore();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (ready && !profile.complete && path !== "/welcome" && path !== "/") router.replace("/welcome");
  }, [ready, profile.complete, path, router]);
  return null;
}
