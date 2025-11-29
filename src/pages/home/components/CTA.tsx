
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';

export default function CTA() {
  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg-hero opacity-95"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-icon absolute top-20 left-20 text-4xl text-white/10">
          <i className="ri-lightbulb-line"></i>
        </div>
        <div className="floating-icon absolute bottom-20 right-20 text-5xl text-white/10">
          <i className="ri-graduation-cap-line"></i>
        </div>
        <div className="floating-icon absolute top-1/2 left-10 text-3xl text-white/10">
          <i className="ri-star-line"></i>
        </div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
          Ready to Start Your
          <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
            Coding Journey?
          </span>
        </h2>
        
        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
          Join thousands of developers who have transformed their careers with DCODE. 
          Start with our free courses and experience world-class coding education.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center mb-8 sm:mb-10 md:mb-12 px-2">
          <Link to="/auth/signin" className="w-full sm:w-auto">
            <Button 
              variant="brand-secondary" 
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 md:px-12 py-3 sm:py-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Start Free Today
              <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
            </Button>
          </Link>
          <Link to="/courses" className="w-full sm:w-auto">
            <Button 
              variant="brand-outline" 
              size="lg" 
              className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 md:px-12 py-3 sm:py-4 border-white/50 text-white hover:bg-white hover:text-brand-primary"
            >
              Browse Courses
              <i className="ri-book-open-line ml-2"></i>
            </Button>
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 text-white/80 mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <i className="ri-shield-check-line text-green-400 text-lg sm:text-xl"></i>
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-time-line text-blue-400 text-lg sm:text-xl"></i>
            <span>Start in 2 Minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-award-line text-yellow-400 text-lg sm:text-xl"></i>
            <span>Money-Back Guarantee</span>
          </div>
        </div>
        
        {/* Success Metrics */}
        <div className="mt-10 sm:mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-brand rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">98%</div>
            <div className="text-xs sm:text-sm text-gray-300">Course Completion</div>
          </div>
          <div className="glass-brand rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-xs sm:text-sm text-gray-300">Student Rating</div>
          </div>
          <div className="glass-brand rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">6 Months</div>
            <div className="text-xs sm:text-sm text-gray-300">Avg. Job Ready</div>
          </div>
          <div className="glass-brand rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-center">
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">$85K</div>
            <div className="text-xs sm:text-sm text-gray-300">Avg. Starting Salary</div>
          </div>
        </div>
      </div>
    </section>
  );
}
