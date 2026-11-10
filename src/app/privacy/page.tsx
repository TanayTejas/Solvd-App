// Privacy policy (also used as the link on Google's sign-in screen).
import Link from "next/link";
import { Logo } from "@/components/ui";

export const metadata = { title: "Privacy · solvd." };

export default function Privacy() {
  return (
    <main className="space-y-4 px-5 pb-12 pt-6 text-[15px] leading-relaxed">
      <Link href="/"><Logo className="text-3xl" /></Link>
      <h1 className="text-2xl font-bold">Privacy policy</h1>
      <p className="text-sm text-muted">Last updated 10 November 2026</p>
      <p>solvd. is a student course project (Innovation and Design Thinking). It is a prototype, not a commercial service.</p>
      <h2 className="font-display font-semibold">What we store</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>The name, role, skills and GitHub username you enter in your profile.</li>
        <li>If you sign in with Google: your Google account id, name and email address. We never see your Google password.</li>
        <li>What you do in the app: niches, requests, upvotes, apps you try or keep, feedback and notifications.</li>
        <li>A random id in your browser&apos;s local storage that keeps you signed in as a guest.</li>
      </ul>
      <h2 className="font-display font-semibold">How we use it</h2>
      <p>Only to run the app: showing your feed, your requests and your profile name to other users. We don&apos;t sell or share your data, show ads or use tracking cookies. Payments in the app are mock payments and no card or UPI details are collected.</p>
      <h2 className="font-display font-semibold">Where it&apos;s kept</h2>
      <p>In a Postgres database hosted by Neon, and the app runs on Vercel.</p>
      <h2 className="font-display font-semibold">Deleting your data</h2>
      <p>Contact the project team through the GitHub repository and we&apos;ll delete your account and everything linked to it.</p>
    </main>
  );
}
