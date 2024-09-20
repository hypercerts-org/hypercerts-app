import "./globals.css";

import { Instrument_Serif } from "next/font/google";

import Footer from "@/components/global/footer";
import MobileNav from "@/components/global/mobile-nav";
import Navbar from "@/components/global/navbar";
import { StepProcessDialogProvider } from "@/components/global/step-process-dialog";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/configs/site";
import { config } from "@/configs/wagmi";
import { Web3ModalProvider } from "@/contexts/wagmi";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  display: "swap",
  variable: "--font-serif",
  subsets: ["latin"],
});

const switzer = localFont({
  src: "./Switzer-Variable.ttf",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: { default: siteConfig.name, template: "%s | Hypercerts" },
  description: siteConfig.description,
  icons: [
    { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16" },
    { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          switzer.variable,
          instrumentSerif.variable,
        )}
      >
        <Web3ModalProvider initialState={initialState}>
          <StepProcessDialogProvider>
            <Navbar />
            {children}
            <MobileNav />
            <Footer />
            <Toaster />
          </StepProcessDialogProvider>
        </Web3ModalProvider>
      </body>
    </html>
  );
}
