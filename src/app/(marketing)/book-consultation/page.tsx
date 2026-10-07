import type { Metadata } from "next";
import { ConsultationForm } from "@/components/marketing/consultation-form";

export const metadata: Metadata = {
  title: "Book a Free Consultation",
  description:
    "Tell us about your construction project. ProxyBuild will reach out to discuss how we can help you build from abroad.",
};

export default function BookConsultationPage() {
  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[var(--pb-orange)] uppercase tracking-widest mb-3">
            Free Consultation
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Tell Us About Your Project
          </h1>
          <p className="text-[var(--pb-text-muted)] text-lg max-w-xl mx-auto">
            Fill in the details below and a ProxyBuild team member will reach
            out within 1–2 business days.
          </p>
        </div>
        <ConsultationForm />
      </div>
    </div>
  );
}
