
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20futuristic%20technology%20workspace%20with%20holographic%20displays%20and%20coding%20interfaces%20in%20purple%20blue%20gradient%20colors%20representing%20digital%20learning%20and%20innovation%20with%20clean%20minimalist%20aesthetic%20perfect%20for%20tech%20education%20platform&width=1920&height=1080&seq=1&orientation=landscape')`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-purple-900/80 to-slate-900/90"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://static.readdy.ai/image/9a8f01f834659f0ab66072bb9b6ee657/94d4f47a77f88d2925bb5eae1005561d.png" 
              alt="DCODE Systems" 
              className="h-20 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Master the Art of
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
              Coding Excellence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
            Join thousands of students learning cutting-edge programming skills from industry experts. 
            Build real projects, get personalized mentorship, and land your dream tech job.
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm sm:text-base">
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/auth/signin">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <i className="ri-rocket-line mr-2"></i>
                Start Learning Now
              </Button>
            </Link>
            <Link to="/courses">
              <Button 
                variant="secondary" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                <i className="ri-play-circle-line mr-2"></i>
                Explore Courses
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-300 text-sm md:text-base">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300 text-sm md:text-base">Expert Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-300 text-sm md:text-base">Job Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-300 text-sm md:text-base">Learning Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <i className="ri-arrow-down-line text-2xl"></i>
      </div>
    </section>
  );
}
