import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Sans_Gurmukhi } from "next/font/google";
import { PresenceProvider } from "@/lib/presence/PresenceProvider";
import GlobalPresenceBar from "@/components/GlobalPresenceBar";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  variable: "--font-gurmukhi",
  subsets: ["gurmukhi"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GEDI MODE",
  description: "Pick a route. Pick a mood. Start the drive.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050506",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${notoSansGurmukhi.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-gedi-black text-gedi-offwhite overflow-x-hidden">
        <PresenceProvider>
          <GlobalPresenceBar />
          {children}
        </PresenceProvider>
      </body>
    </html>
  );
}
