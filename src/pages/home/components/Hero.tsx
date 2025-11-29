import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Load animation from public folder
    fetch('/Programming Computer.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* DCODE Logo - Centered */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Live with DCODE.png" 
          alt="DCODE Systems Logo" 
          className="w-full h-full object-cover opacity-100"
        />
      </div>

      {/* Mobile Layout - Stacked Vertically */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 flex flex-col items-center justify-between min-h-screen py-20 md:py-0 md:justify-center">
        
        {/* Lottie Animation - Hidden on Mobile, Visible on Desktop */}
        {animationData && (
          <div className="hidden md:block absolute top-20 right-8 lg:right-16 z-10">
            <div className="w-48 md:w-64 lg:w-80 h-48 md:h-64 lg:h-80">
              <Lottie 
                animationData={animationData} 
                loop={true}
                autoplay={true}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Stats - Middle Section on Mobile, Bottom Left on Desktop */}
        <div className="w-full max-w-4xl mb-8 md:mb-0 md:absolute md:bottom-8 md:left-4 lg:left-6 xl:left-8 md:w-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center md:text-left px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">10K+</div>
              <div className="text-white text-[10px] sm:text-xs md:text-sm">Active Students</div>
            </div>
            <div className="text-center md:text-left px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">500+</div>
              <div className="text-white text-[10px] sm:text-xs md:text-sm">Expert Mentors</div>
            </div>
            <div className="text-center md:text-left px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">95%</div>
              <div className="text-white text-[10px] sm:text-xs md:text-sm">Job Success</div>
            </div>
            <div className="text-center md:text-left px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">24/7</div>
              <div className="text-white text-[10px] sm:text-xs md:text-sm">Support</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons - Bottom Section on Mobile, Bottom Right on Desktop */}
        <div className="w-full max-w-md md:max-w-none md:w-auto md:absolute md:bottom-8 md:right-4 md:sm:right-8 lg:right-12 xl:right-16">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to="/auth/signin" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <i className="ri-rocket-line mr-2"></i>
                Start Learning Now
              </Button>
            </Link>
            <Link to="/courses" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50 hover:border-gray-950 transform hover:scale-105 transition-all duration-300 shadow-2xl rounded-lg flex items-center justify-center gap-2"
              >
                <i className="ri-play-circle-line"></i>
                Explore Courses
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on Mobile */}
        <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-600 animate-bounce z-10">
          <i className="ri-arrow-down-line text-2xl"></i>
        </div>
      </div>
    </section>
  );
}
