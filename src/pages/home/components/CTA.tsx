
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
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
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-glow">
          Ready to Start Your
          <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
            Coding Journey?
          </span>
        </h2>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of developers who have transformed their careers with DCODE. 
          Start with our free courses and experience world-class coding education.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Link to="/auth/signin">
            <Button 
              variant="brand-secondary" 
              size="lg" 
              className="text-lg px-12 py-4 min-w-[220px] bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Start Free Today
              <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
            </Button>
          </Link>
          <Link to="/courses">
            <Button 
              variant="brand-outline" 
              size="lg" 
              className="text-lg px-12 py-4 min-w-[220px] border-white/50 text-white hover:bg-white hover:text-brand-primary"
            >
              Browse Courses
              <i className="ri-book-open-line ml-2"></i>
            </Button>
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
          <div className="flex items-center gap-2">
            <i className="ri-shield-check-line text-green-400"></i>
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-time-line text-blue-400"></i>
            <span>Start Learning in 2 Minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-award-line text-yellow-400"></i>
            <span>Money-Back Guarantee</span>
          </div>
        </div>
        
        {/* Success Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-brand rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">98%</div>
            <div className="text-sm text-gray-300">Course Completion</div>
          </div>
          <div className="glass-brand rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-sm text-gray-300">Student Rating</div>
          </div>
          <div className="glass-brand rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">6 Months</div>
            <div className="text-sm text-gray-300">Avg. Job Ready</div>
          </div>
          <div className="glass-brand rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">$85K</div>
            <div className="text-sm text-gray-300">Avg. Starting Salary</div>
          </div>
        </div>
      </div>
    </section>
  );
}
