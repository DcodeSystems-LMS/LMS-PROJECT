
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/Live with DCODE.png')`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-slate-900/20 to-slate-900/30"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 hidden sm:block">
        <div className="absolute top-20 left-10 md:left-20 w-48 md:w-72 h-48 md:h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 md:right-20 w-60 md:w-96 h-60 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 md:w-80 h-56 md:h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Feature Highlights - Below SYSTEMS text in background image */}
      <div className="absolute top-[67%] left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-base px-2">
          <div className="flex items-center text-blue-200">
            <i className="ri-code-line mr-2 text-lg"></i>
            <span>Live Coding Sessions</span>
          </div>
          <div className="flex items-center text-purple-200">
            <i className="ri-user-star-line mr-2 text-lg"></i>
            <span>Expert Mentors</span>
          </div>
          <div className="flex items-center text-orange-200">
            <i className="ri-trophy-line mr-2 text-lg"></i>
            <span>Real Projects</span>
          </div>
          <div className="flex items-center text-green-200">
            <i className="ri-briefcase-line mr-2 text-lg"></i>
            <span>Job Placement</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons - Bottom Right */}
      <div className="absolute bottom-8 right-4 sm:right-8 md:right-12 lg:right-16 z-10">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link to="/auth/signin">
            <Button 
              size="lg" 
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl w-full sm:w-auto"
            >
              <i className="ri-rocket-line mr-2"></i>
              Start Learning Now
            </Button>
          </Link>
          <Link to="/courses">
            <Button 
              variant="secondary" 
              size="lg"
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              <i className="ri-play-circle-line mr-2"></i>
              Explore Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats - Bottom Left */}
      <div className="absolute bottom-8 left-4 sm:left-8 md:left-12 lg:left-16 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <div className="text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">10K+</div>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">Active Students</div>
          </div>
          <div className="text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">500+</div>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">Expert Mentors</div>
          </div>
          <div className="text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">95%</div>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">Job Success Rate</div>
          </div>
          <div className="text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">24/7</div>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">Learning Support</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce hidden sm:block">
        <i className="ri-arrow-down-line text-2xl"></i>
      </div>
    </section>
  );
}
