import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/coming-soon";

export const metadata: Metadata = { title: "Why ProxyBuild" };

export default function WhyProxyBuildPage() {
  return (
    <ComingSoon
      title="Why ProxyBuild?"
      description="We're building out a page that shows exactly why ProxyBuild is the trusted choice for diaspora clients. Check back soon, or book a consultation to hear it from us directly."
    />
  );
}
