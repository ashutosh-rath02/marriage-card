import type { Metadata, Viewport } from "next";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "@fontsource/yatra-one/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shubh Vivah · A Rajasthani Wedding Invitation",
  description: "Padharo mhare desh: open the card and step into four rooms, from haldi to the reception.",
  openGraph: {
    title: "Shubh Vivah · You're invited",
    description: "Padharo mhare desh: open the card and step into four rooms, from haldi to the reception.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5b0f35",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
