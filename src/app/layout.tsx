import type { Metadata } from "next";
import { Geist, Fredoka } from "next/font/google";
import "./globals.css";
import { TanStackProvider } from "@/lib/TanstackProvider";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const FredokaFont = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "10X School",
  description: "Gamified fast math learning for kids from Ages 5–18. Learn fast math easy just through games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${FredokaFont.variable} antialiased grid-background`}
      >
        {/* TrustBox script */}
        <Script
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="afterInteractive"
          async
        />
        <TanStackProvider>{children}</TanStackProvider>
        <Toaster />
      </body>
    </html>
  );
}
