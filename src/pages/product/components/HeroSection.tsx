import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';
import AIAutomationModal from './AIAutomationModal';
import IoTDeepInfoModal from './IoTDeepInfoModal';
import DataAnalyticsDeepInfoModal from './DataAnalyticsDeepInfoModal';
import SoftwareSolutionsDeepInfoModal from './SoftwareSolutionsDeepInfoModal';

interface HeroSectionProps {
  onModalOpen?: (modal: string) => void;
}

export default function HeroSection({ onModalOpen }: HeroSectionProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    { icon: "ri-code-s-slash-line", color: "text-blue-400", label: "Code Playground" },
    { icon: "ri-brain-line", color: "text-purple-400", label: "AI Assessment" },
    { icon: "ri-video-line", color: "text-orange-400", label: "Video Learning" },
    { icon: "ri-flashlight-line", color: "text-cyan-400", label: "Real-time Collab" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Interactive Floating Elements with Feature Showcase */}
      <div className="absolute inset-0 pointer-events-none">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={`absolute text-4xl ${feature.color} ${
              currentFeature === index ? 'opacity-100 scale-110' : 'opacity-30 scale-100'
            } transition-all duration-500`}
            style={{
              left: `${15 + index * 20}%`,
              top: `${20 + (index % 2) * 40}%`
            }}
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 3 + index * 0.5, 
              repeat: Infinity,
              delay: index * 0.5
            }}
          >
            <i className={feature.icon}></i>
          </motion.div>
        ))}
      </div>

      {/* Animated Data Flow Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {[...Array(6)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${20 + i * 15} ${30 + (i % 2) * 40} Q ${50 + i * 10} ${50} ${80 - i * 10} ${70 - (i % 2) * 20}`}
              stroke="rgba(168, 85, 247, 0.3)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ 
                duration: 2 + i * 0.3, 
                repeat: Infinity,
                delay: i * 0.5,
                repeatDelay: 3
              }}
            />
          ))}
        </svg>
      </div>

      {/* Floating Code Snippets */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-xs text-white/20 font-mono"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8
            }}
          >
            {['const', 'function', 'class', 'import', 'export', 'async', 'await', 'return'][i]}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo with Enhanced Animation */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", damping: 10 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 2, -2, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src="https://static.readdy.ai/image/9a8f01f834659f0ab66072bb9b6ee657/94d4f47a77f88d2925bb5eae1005561d.png" 
                alt="DCodesystems LMS" 
                className="h-24 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.div>
          </motion.div>

          {/* Dynamic Feature Indicator */}
          <motion.div
            className="mb-6"
            key={currentFeature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <i className={`${features[currentFeature].icon} ${features[currentFeature].color} text-lg`}></i>
              <span className="text-white text-sm font-medium">{features[currentFeature].label}</span>
            </div>
          </motion.div>

          {/* Main Heading with Typewriter Effect */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.span 
              className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              DCodesystems
            </motion.span>
            <motion.span 
              className="block bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              LMS Platform
            </motion.span>
          </motion.h1>

          {/* Dynamic Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            The complete learning management system for modern education. 
            Build, teach, and scale with our powerful LMS platform.
          </motion.p>

          {/* Enhanced Feature Highlights with Animation */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 mb-12 text-sm sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {[
              { icon: "ri-code-line", color: "text-blue-200", label: "Interactive Code Playground" },
              { icon: "ri-bar-chart-line", color: "text-purple-200", label: "Real-time Analytics" },
              { icon: "ri-shield-check-line", color: "text-orange-200", label: "Secure Authentication" },
              { icon: "ri-smartphone-line", color: "text-green-200", label: "Mobile-Friendly" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`flex items-center ${feature.color} hover:scale-105 transition-transform duration-300 cursor-pointer`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.i 
                  className={`${feature.icon} mr-2 text-lg`}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2 + index * 0.5, 
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />
                <span>{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced CTA Buttons with Advanced Animations */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/auth/signin">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <i className="ri-rocket-line mr-2 relative z-10"></i>
                  <span className="relative z-10">Request Demo</span>
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/courses">
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8 }}
                  />
                  <i className="ri-play-circle-line mr-2 relative z-10"></i>
                  <span className="relative z-10">View Courses</span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats with Interactive Animations */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {[
              { 
                value: "AI Powered", 
                label: "Automation",
                icon: "ri-robot-line",
                color: "text-blue-400",
                gradient: "from-blue-500 to-cyan-500",
                modal: "ai"
              },
              { 
                value: "IOT", 
                label: "Solutions",
                icon: "ri-wifi-line",
                color: "text-purple-400",
                gradient: "from-purple-500 to-pink-500",
                modal: "iot"
              },
              { 
                value: "Data", 
                label: "Analytics",
                icon: "ri-bar-chart-line",
                color: "text-orange-400",
                gradient: "from-orange-500 to-red-500",
                modal: "data"
              },
              { 
                value: "Software", 
                label: "Solutions",
                icon: "ri-code-s-slash-line",
                color: "text-green-400",
                gradient: "from-green-500 to-emerald-500",
                modal: "software"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5
                }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Box clicked:', stat.modal);
                  if (onModalOpen) {
                    onModalOpen(stat.modal);
                  }
                }}
              >
                <motion.div
                  className="relative mb-4"
                  animate={{ 
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3 + index * 0.5, 
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                >
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} bg-opacity-20 flex items-center justify-center mb-3 group-hover:bg-opacity-30 transition-all duration-300`}>
                    <i className={`${stat.icon} ${stat.color} text-2xl`}></i>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-white mb-2"
                  animate={{ 
                    textShadow: [
                      "0 0 0px rgba(255,255,255,0)",
                      "0 0 20px rgba(255,255,255,0.3)",
                      "0 0 0px rgba(255,255,255,0)"
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-300 text-sm md:text-base">{stat.label}</div>
                
                {/* Hover Effect Lines */}
                <motion.div
                  className="absolute inset-0 border-2 border-transparent rounded-xl"
                  whileHover={{
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 flex flex-col items-center"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-xs text-white/40 mb-1">Scroll to explore</span>
          <motion.div
            animate={{ 
              y: [0, 5, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <i className="ri-arrow-down-line text-2xl"></i>
          </motion.div>
        </motion.div>
        
        {/* Animated Dots */}
        <motion.div 
          className="flex gap-1 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-white/40 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>

    </section>
  );
}
