import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/coming-soon";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <ComingSoon
      title="About ProxyBuild"
      description="We're putting the finishing touches on our About page. In the meantime, book a free consultation to learn about our story, our team, and how we're helping the African diaspora build back home."
    />
  );
}
