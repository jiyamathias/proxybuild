import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://proxybuild.africa"
  ),
  icons: {
    icon: [{ url: "/logo-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/logo-icon.png", sizes: "180x180", type: "image/png" }],
  },
  title: {
    default:
      "ProxyBuild Africa — Construction Management for the African Diaspora",
    template: "%s | ProxyBuild Africa",
  },
  description:
    "ProxyBuild Africa directly manages construction projects for Africans living abroad. New builds, renovations, hotels, commercial developments — our team is on the ground in Nigeria so you never have to worry.",
  keywords: [
    "build house Nigeria from UK",
    "build house Nigeria from USA",
    "build house Nigeria from abroad",
    "construction company Nigeria diaspora",
    "diaspora construction Nigeria",
    "Nigerian construction management company",
    "build property Nigeria abroad",
    "house construction Lagos",
    "house construction Abuja",
    "trusted construction company Nigeria",
    "construction project management Nigeria",
    "build hotel Nigeria",
    "ProxyBuild Africa",
  ],
  authors: [{ name: "ProxyBuild Africa", url: "https://proxybuild.africa" }],
  creator: "ProxyBuild Africa",
  publisher: "ProxyBuild Africa",
  category: "Construction",
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["en_US", "en_NG"],
    siteName: "ProxyBuild Africa",
    title:
      "ProxyBuild Africa — Construction Management for the African Diaspora",
    description:
      "Build your home or commercial property in Nigeria with confidence. ProxyBuild's own team manages every phase — from ground-breaking to handover — while you stay abroad.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ProxyBuild Africa — Construction Execution Platform for the Diaspora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@proxybuildng",
    creator: "@proxybuildng",
    title: "ProxyBuild Africa — Build Back Home with Confidence",
    description:
      "Construction managed by our own team in Nigeria. New builds, renovations, hotels and commercial projects — all handled end-to-end for the African diaspora.",
    images: ["/og-image.jpg"],
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  },
  alternates: {
    canonical: "https://proxybuild.africa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <OrganizationJsonLd />
        {children}
      </body>
    </html>
  );
}
