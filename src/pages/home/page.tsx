
import { useEffect, useState } from 'react';
import Header from '@/components/feature/Header';
import Footer from '@/components/feature/Footer';
import Hero from '@/pages/home/components/Hero';
import Features from '@/pages/home/components/Features';
import Testimonials from '@/pages/home/components/Testimonials';
import CTA from '@/pages/home/components/CTA';

// Floating Icons Component
const FloatingIcons = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="floating-icon absolute top-20 left-10 text-6xl text-blue-400">
        <i className="ri-code-s-slash-line"></i>
      </div>
      <div className="floating-icon absolute top-40 right-20 text-5xl text-purple-400">
        <i className="ri-brain-line"></i>
      </div>
      <div className="floating-icon absolute top-60 left-1/4 text-4xl text-pink-400">
        <i className="ri-graduation-cap-line"></i>
      </div>
      <div className="floating-icon absolute bottom-40 right-1/4 text-5xl text-cyan-400">
        <i className="ri-rocket-line"></i>
      </div>
      <div className="floating-icon absolute bottom-20 left-1/3 text-6xl text-indigo-400">
        <i className="ri-trophy-line"></i>
      </div>
    </div>
  );
};

// Scroll Animation Hook
const useScrollAnimation = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return visibleSections;
};

export default function HomePage() {
  const visibleSections = useScrollAnimation();

  return (
    <div className="min-h-screen relative">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 gradient-bg"></div>
      
      {/* Floating Icons */}
      <FloatingIcons />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main>
          <div 
            id="hero" 
            data-animate 
            className={`transition-all duration-1000 ${
              visibleSections.has('hero') ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <Hero />
          </div>
          
          <div 
            id="features" 
            data-animate 
            className={`transition-all duration-1000 ${
              visibleSections.has('features') ? 'animate-fade-in-up animate-delay-200' : 'opacity-0'
            }`}
          >
            <Features />
          </div>
          
          <div 
            id="testimonials" 
            data-animate 
            className={`transition-all duration-1000 ${
              visibleSections.has('testimonials') ? 'animate-fade-in-up animate-delay-300' : 'opacity-0'
            }`}
          >
            <Testimonials />
          </div>
          
          <div 
            id="cta" 
            data-animate 
            className={`transition-all duration-1000 ${
              visibleSections.has('cta') ? 'animate-fade-in-up animate-delay-100' : 'opacity-0'
            }`}
          >
            <CTA />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
