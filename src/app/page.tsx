"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui";

// Entry point: new visitors create a profile, then pick their niche; returning visitors go to the feed.
export default function Home() {
  const { ready, onboarded, profile, guest } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(!profile.complete && !guest ? "/welcome" : onboarded ? "/feed" : "/onboarding");
  }, [ready, onboarded, profile.complete, guest, router]);
  return <div className="grid min-h-dvh place-items-center"><Logo className="text-5xl" /></div>;
}
