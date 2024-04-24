import { siteConfig } from "@/configs/site";
import { config } from "@/configs/wagmi";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import "./globals.css";
import { Web3ModalProvider } from "@/contexts/wagmi";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const instrumentSerif = Instrument_Serif({
  weight: "400",
  display: "swap",
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: { default: siteConfig.name, template: "%s | Hypercerts" },
  description: siteConfig.description,
  icons: [
    { rel: "shortcut icon", url: "/favicon.ico", type: "image/x-icon" },
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
          inter.variable,
          instrumentSerif.variable
        )}
      >
        <Web3ModalProvider initialState={initialState}>
          {children}
        </Web3ModalProvider>
      </body>
    </html>
  );
}
