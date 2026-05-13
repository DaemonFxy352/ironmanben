import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "IRONMAN Jacksonville Support HQ",
  description: "Race day support hub for tracking Ben through IRONMAN Jacksonville.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Race HQ",
  },
  icons: {
    apple: "/icon-192.png",
    icon: [
      {
        rel: "icon",
        sizes: "192x192",
        url: "/icon-192.png",
      },
      {
        rel: "icon",
        sizes: "512x512",
        url: "/icon-512.png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
