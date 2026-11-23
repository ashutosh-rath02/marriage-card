import type { Metadata, Viewport } from "next";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "@fontsource/yatra-one/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "unfold — a journal house",
  description: "A pop-up book of rooms, drawn in blue ink.",
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
