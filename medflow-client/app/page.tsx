// app/page.tsx
import Header from "./Header";
import HeroSection from "./HeroSection";
import ProcessSection from "./ProcessSection";
import FeaturesSection from "./FeaturesSection";
import ExpertSection from "./ExpertSection";
import TestimonialsSection from "./TestimonialsSection";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Navbar */}
      <Header />

      {/* Main Landing Page Flow */}
      <main>
        <HeroSection />
        <ProcessSection />
        <FeaturesSection />
        <ExpertSection />
        <TestimonialsSection />
      </main>

      {/* Footer & Chat Widget */}
      <Footer />
      <ChatWidget />
    </div>
  );
}
