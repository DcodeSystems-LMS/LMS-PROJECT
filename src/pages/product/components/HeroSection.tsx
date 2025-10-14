import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Code Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-4xl text-blue-400/30"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <i className="ri-code-s-slash-line"></i>
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-3xl text-purple-400/30"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <i className="ri-brain-line"></i>
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-1/4 text-5xl text-orange-400/30"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <i className="ri-graduation-cap-line"></i>
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-1/3 text-4xl text-cyan-400/30"
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <i className="ri-rocket-line"></i>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://static.readdy.ai/image/9a8f01f834659f0ab66072bb9b6ee657/94d4f47a77f88d2925bb5eae1005561d.png" 
              alt="DCodesystems LMS" 
              className="h-24 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              DCodesystems
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              LMS Platform
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            The complete learning management system for modern education. 
            Build, teach, and scale with our powerful LMS platform.
          </motion.p>

          {/* Feature Highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 mb-12 text-sm sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="flex items-center text-blue-200">
              <i className="ri-code-line mr-2 text-lg"></i>
              <span>Interactive Code Playground</span>
            </div>
            <div className="flex items-center text-purple-200">
              <i className="ri-bar-chart-line mr-2 text-lg"></i>
              <span>Real-time Analytics</span>
            </div>
            <div className="flex items-center text-orange-200">
              <i className="ri-shield-check-line mr-2 text-lg"></i>
              <span>Secure Authentication</span>
            </div>
            <div className="flex items-center text-green-200">
              <i className="ri-smartphone-line mr-2 text-lg"></i>
              <span>Mobile-Friendly</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <Link to="/auth/signin">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <i className="ri-rocket-line mr-2"></i>
                Request Demo
              </Button>
            </Link>
            <Link to="/courses">
              <Button 
                variant="secondary" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                <i className="ri-play-circle-line mr-2"></i>
                View Courses
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-300 text-sm md:text-base">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-gray-300 text-sm md:text-base">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-300 text-sm md:text-base">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-300 text-sm md:text-base">Support</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <i className="ri-arrow-down-line text-2xl"></i>
      </motion.div>
    </section>
  );
}
