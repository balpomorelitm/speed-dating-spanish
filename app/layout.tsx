import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://balpomorelitm.github.io/speed-dating-spanish/"),
  title: "Speed Dating en español",
  description: "Habla, elige y diviértete con esta actividad de Español en HKU.",
  openGraph: {
    title: "Speed Dating en español",
    description: "Una actividad táctil para practicar español en HKU.",
    type: "website",
    url: "https://balpomorelitm.github.io/speed-dating-spanish/",
    images: [{ url: "/speed-dating-spanish/og-v2.png", width: 1664, height: 935 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Speed Dating en español",
    description: "Habla, elige y diviértete.",
    images: ["/speed-dating-spanish/og-v2.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7a003c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
