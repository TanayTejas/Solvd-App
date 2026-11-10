// Google sign-in (Auth.js). It switches itself on only when these are set in Vercel:
//   AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET
// Until then the app keeps working with guest accounts.
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const authEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET,
);

export const { handlers, auth } = NextAuth({
  providers: authEnabled ? [Google] : [],
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.AUTH_SECRET || "sign-in-disabled",
  callbacks: {
    // Put Google's stable account id on the session so the API can find the user.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

export type GoogleAccount = { sub: string; email: string; name: string };

/** The signed-in Google account for this request, or null. */
export async function currentGoogleAccount(): Promise<GoogleAccount | null> {
  if (!authEnabled) return null;
  const s = await auth();
  if (!s?.user?.id) return null;
  return { sub: s.user.id, email: s.user.email ?? "", name: s.user.name ?? "" };
}
