import { Availability } from "@/components/landing/Availability";
import { ContactSection } from "@/components/landing/ContactSection";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ImpactStats } from "@/components/landing/ImpactStats";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeatureCards />
        <Availability />
        <ImpactStats />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
