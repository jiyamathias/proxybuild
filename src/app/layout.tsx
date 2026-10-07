import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://proxybuild.com"
  ),
  title: {
    default: "ProxyBuild — We Build Your Vision, Even While You're Away",
    template: "%s | ProxyBuild",
  },
  description:
    "ProxyBuild helps Africans living abroad build, renovate and manage property back home with managed construction teams, structured milestones and full digital transparency.",
  keywords: [
    "construction management Nigeria",
    "build house Nigeria from abroad",
    "diaspora construction Nigeria",
    "Nigerian construction company UK",
    "build house Nigeria from UK",
    "property construction management Lagos",
    "trusted construction company Nigeria",
  ],
  authors: [{ name: "ProxyBuild Africa" }],
  creator: "ProxyBuild Africa",
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "ProxyBuild",
    title: "ProxyBuild — We Build Your Vision, Even While You're Away",
    description:
      "ProxyBuild helps Africans living abroad build, renovate and manage property back home with full digital transparency.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ProxyBuild — Construction Execution Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProxyBuild — We Build Your Vision, Even While You're Away",
    description:
      "ProxyBuild helps Africans living abroad build, renovate and manage property back home.",
    images: ["/og-image.jpg"],
    creator: "@proxybuild",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
