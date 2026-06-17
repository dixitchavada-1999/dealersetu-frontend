import ScrollToTop from '../../components/ScrollToTop';
import { COLORS } from './data';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturesSection from './components/FeaturesSection';
import HowItWorks from './components/HowItWorks';
import UseCases from './components/UseCases';
import Pricing from './components/Pricing';
import DownloadApp from './components/DownloadApp';
import Testimonials from './components/Testimonials';
import Faq from './components/Faq';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';

/** Marketing landing page — composed of self-contained sections. */
export default function LandingPage() {
  return (
    <div className="landing-scope min-h-screen text-slate-900 scroll-smooth overflow-x-hidden relative" style={{ backgroundColor: COLORS.bg }}>
      <div className="landing-orbs">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <Hero />
        <FeaturesSection />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <DownloadApp />
        <Testimonials />
        <Faq />
        <CtaSection />
        <Footer />
      </div>
      <ScrollToTop />
    </div>
  );
}
