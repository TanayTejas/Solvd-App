import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Toast from "@/components/Toast";
import ProfileGate from "@/components/ProfileGate";
import AccountPrompt from "@/components/AccountPrompt";
import Splash from "@/components/Splash";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "solvd. — Tiny apps, picked for your exact niche",
  description: "A problem-first marketplace for tiny AI-powered micro-apps.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#7C5CFF" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable}`}>
        <StoreProvider>
          {/* Phone-sized column: 390px wide on desktop, full width on a phone */}
          <div className="mx-auto min-h-dvh max-w-[430px] bg-white sm:my-0 sm:shadow-[0_0_60px_-20px_rgba(60,40,140,0.35)] relative">
            {children}
            <Toast />
            <ProfileGate />
            <AccountPrompt />
            <Splash />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
