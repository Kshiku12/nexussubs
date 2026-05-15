import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Chatbot from "@/components/Chatbot";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "NexusSubs | Real-Time Subscriptions",
  description: "Manage your OTT and Gaming subscriptions in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.className} suppressHydrationWarning>
        <Providers>
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
