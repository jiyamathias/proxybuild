import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/coming-soon";

export const metadata: Metadata = { title: "How It Works" };

export default function HowItWorksPage() {
  return (
    <ComingSoon
      title="How It Works"
      description="A detailed walkthrough of our process — from initial consultation to project handover — is coming soon. Book a free call and we'll walk you through it personally."
    />
  );
}
