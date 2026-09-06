import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "ACE Exchange",
  title: { default:"ACE Exchange | Trade. Create. Connect.", template:"%s | ACE Exchange" },
  description: "ACE Exchange is a connected digital-asset ecosystem for markets, wallet access, creators and community.",
  metadataBase: new URL("https://www.aceexchange.io"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "ACE Exchange | Trade. Create. Connect.",
    description: "A modern digital-asset platform connecting markets, ownership, creators and community through one ACE experience.",
    url: "https://www.aceexchange.io/",
    siteName: "ACE Exchange",
    type: "website",
  },
  twitter: { card:"summary_large_image", title:"ACE Exchange | Trade. Create. Connect.", description:"Trade. Create. Connect. One connected ACE digital-asset ecosystem." },
  robots: { index:true, follow:true },
};

export const viewport: Viewport = { themeColor:"#07111F", colorScheme:"dark", width:"device-width", initialScale:1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
