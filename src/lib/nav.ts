"use client";
// In-app history, so "Back" always goes to the previous *different* screen inside
// solvd. It never leaves the app, never bounces between two screens, and never
// "does nothing" because the same page was opened twice (e.g. a double tap).
// If there's nothing to go back to (you opened a shared link), Back goes "up" to the parent screen.
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const stack: string[] = [];
let poppingBack = false;
let lastOp: "push" | "replace" | null = null;
let installed = false;

// Watch how Next.js changes the address bar, so our list matches the real browser history.
function install() {
  if (installed) return;
  installed = true;
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  const sameAsNow = (url?: string | URL | null) => !url || new URL(String(url), location.href).href === location.href;
  history.pushState = (state, title, url) => {
    // Opening the page you're already on (e.g. a double tap) shouldn't add a history entry.
    if (sameAsNow(url)) return replace(state, title, url);
    lastOp = "push";
    return push(state, title, url);
  };
  history.replaceState = (state, title, url) => {
    if (!sameAsNow(url)) lastOp = "replace";
    return replace(state, title, url);
  };
}

export function useNavTracker() {
  const path = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    install();
    const onPop = () => { poppingBack = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    const url = search ? `${path}?${search}` : path;
    if (poppingBack) {
      // Browser/phone back button: drop entries until we're at this screen.
      while (stack.length > 1 && stack[stack.length - 1] !== url) stack.pop();
      if (!stack.length) stack.push(url);
    } else if (lastOp === "replace" && stack.length) {
      stack[stack.length - 1] = url;
    } else if (stack[stack.length - 1] !== url) {
      stack.push(url);
    }
    poppingBack = false;
    lastOp = null;
  }, [path, search]);
}

/** Go back to the previous different screen inside the app, or to `up` if there isn't one. */
export function goBack(router: { replace: (href: string) => void }, up: string) {
  const current = stack[stack.length - 1];
  let steps = 0;
  for (let i = stack.length - 2; i >= 0; i--) {
    steps++;
    if (stack[i] !== current && !stack[i].startsWith("/welcome") && stack[i] !== "/") {
      stack.length = i + 1;
      window.history.go(-steps);
      return;
    }
  }
  stack.length = 0;
  router.replace(up);
}
