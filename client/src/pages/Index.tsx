import ContactSection from "@/components/ContactSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar/>
      <HeroSection/>
      <FeaturesSection/>
      <ContactSection/>
      
      <Footer/>
    </div>
  );
};

export default Index;
