export const siteConfig = {
  name: "ProxyBuild",
  legalName: "ProxyBuild Africa",
  tagline: "We Build Your Vision — Even While You're Away.",
  description:
    "ProxyBuild helps Africans living abroad build, renovate and manage property back home with managed construction teams, structured milestones and full digital transparency.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://proxybuild.africa",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+234",
  emails: {
    support: "hello@proxybuild.africa",
    info: "info@proxybuild.africa",
  },
  social: {
    instagram: "https://instagram.com/proxybuild",
    twitter: "https://x.com/proxybuild",
    linkedin: "https://linkedin.com/company/proxybuild",
  },
  nav: [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Why ProxyBuild", href: "/why-proxybuild" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
