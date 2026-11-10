// Pre-builds the pages for the sample apps, so opening them is instant (no server wait).
// Apps published later still work: their pages are built on first visit.
import { APPS } from "@/lib/data";

export function generateStaticParams() {
  return APPS.map((a) => ({ slug: a.slug }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
