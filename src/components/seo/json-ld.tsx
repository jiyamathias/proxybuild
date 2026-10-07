export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness", "HomeAndConstructionBusiness"],
        "@id": "https://proxybuild.africa/#organization",
        name: "ProxyBuild Africa",
        alternateName: "ProxyBuild",
        url: "https://proxybuild.africa",
        logo: {
          "@type": "ImageObject",
          url: "https://proxybuild.africa/logo-wordmark.png",
          width: 1566,
          height: 522,
        },
        image: "https://proxybuild.africa/logo-icon.png",
        description:
          "ProxyBuild Africa is a construction execution company that directly manages residential and commercial building projects for the African diaspora. We handle new builds, renovations, hotels, hostels and commercial developments across Nigeria — with our own project managers and site teams on the ground.",
        foundingDate: "2022",
        areaServed: [
          { "@type": "City", name: "Lagos" },
          { "@type": "City", name: "Abuja" },
          { "@type": "City", name: "Port Harcourt" },
          { "@type": "City", name: "Ibadan" },
          { "@type": "City", name: "Enugu" },
          { "@type": "Country", name: "Nigeria" },
        ],
        knowsAbout: [
          "Construction project management",
          "Residential building Nigeria",
          "Commercial construction Nigeria",
          "Diaspora property development",
          "Hotel construction Nigeria",
          "House renovation Nigeria",
        ],
        slogan: "We Build Your Vision, Even While You're Away",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "hello@proxybuild.africa",
          availableLanguage: "English",
        },
        sameAs: [],
      },
      {
        "@type": "WebSite",
        "@id": "https://proxybuild.africa/#website",
        url: "https://proxybuild.africa",
        name: "ProxyBuild Africa",
        publisher: { "@id": "https://proxybuild.africa/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://proxybuild.africa/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      "@id": "https://proxybuild.africa/#organization",
      name: "ProxyBuild Africa",
    },
    areaServed: { "@type": "Country", name: "Nigeria" },
    serviceType: "Construction Management",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
