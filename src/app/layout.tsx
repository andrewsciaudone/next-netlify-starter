import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter-tight";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Finest Uniform — Everyday clothing, issued with purpose",
    template: "%s — Finest Uniform",
  },
  description:
    "The clothes you wear when you don't want to think about clothes. Numbered forms, issued with purpose. The everyday extension of Finest Form.",
};

export const viewport: Viewport = {
  themeColor: "#f3f0e9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
