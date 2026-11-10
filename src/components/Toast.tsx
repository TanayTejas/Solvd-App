"use client";
import { useStore } from "@/lib/store";

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-6">
      <div className="animate-pop max-w-[380px] rounded-2xl bg-ink px-4 py-3 text-center text-sm font-medium text-white shadow-soft">{toast}</div>
    </div>
  );
}
