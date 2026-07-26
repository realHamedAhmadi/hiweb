import { HeroSection } from "@/components/home/HeroSection";
import { ServicesPreviewSection } from "@/components/home/ServicesPreviewSection";
import { PortfolioPreviewSection } from "@/components/home/PortfolioPreviewSection";
import { TrustSection } from "@/components/home/TrustSection";
import { CTASection } from "@/components/home/CTASection";

/**
 * Home page — structural foundation only.
 * Section order: Hero → Services preview → Portfolio preview →
 * Trust/security → CTA, per instruction.
 *
 * All content within each section is placeholder text — see individual
 * section components for notes on what's real (decided) vs. illustrative.
 * No backend/data fetching, no business logic — every list here is a
 * hardcoded local placeholder array.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreviewSection />
      <PortfolioPreviewSection />
      <TrustSection />
      <CTASection />
    </>
  );
}
