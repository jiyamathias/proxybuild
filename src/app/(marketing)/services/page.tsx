import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/coming-soon";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <ComingSoon
      title="Our Services"
      description="From new builds and renovations to site preparation and finishing works — our full services page is coming soon. Book a consultation to discuss what you need."
    />
  );
}
