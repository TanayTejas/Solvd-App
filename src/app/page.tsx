"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui";

// Entry point: first-time visitors pick their niche, returning visitors go to the feed.
export default function Home() {
  const { ready, onboarded } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(onboarded ? "/feed" : "/onboarding");
  }, [ready, onboarded, router]);
  return <div className="grid min-h-dvh place-items-center"><Logo className="text-5xl" /></div>;
}
