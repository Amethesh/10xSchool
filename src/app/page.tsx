import AboutSection from "@/components/Home/AboutUs";
import FAQComponent from "@/components/Home/FAQ";
import Footer from "@/components/Home/Footer";
import GetStarted from "@/components/Home/GetStarted";
import Hero from "@/components/Home/Hero";
import Testimonials from "@/components/Home/Testimonials";
import WhatWeDoSection from "@/components/Home/WhatWeDo";

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutSection />
      <WhatWeDoSection />
      <Testimonials />
      <FAQComponent />
      <GetStarted />
      <Footer />
    </main>
  );
}
