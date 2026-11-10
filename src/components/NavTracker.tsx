"use client";
import { Suspense } from "react";
import { useNavTracker } from "@/lib/nav";

function Tracker() {
  useNavTracker();
  return null;
}

export default function NavTracker() {
  return <Suspense><Tracker /></Suspense>;
}
