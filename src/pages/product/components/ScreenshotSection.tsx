import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Screenshot Components
const CodePlaygroundScreenshot = () => (
  <div className="bg-gray-900 text-white p-6 rounded-lg">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
      <div className="text-sm text-gray-400">Code Playground</div>
    </div>
    <div className="bg-gray-800 rounded p-4 mb-4">
      <div className="text-green-400 text-sm font-mono">
        <div><span className="text-blue-400">function</span> <span className="text-yellow-400">helloWorld</span>() {'{'}</div>
        <div className="ml-4 text-white">console.log(<span className="text-green-300">"Hello, World!"</span>);</div>
        <div>{'}'}</div>
      </div>
    </div>
    <div className="bg-gray-800 rounded p-4">
      <div className="text-gray-400 text-sm mb-2">Output:</div>
        <div className="text-green-400 text-sm">Hello, World!</div>
    </div>
  </div>
);

const AnalyticsScreenshot = () => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Analytics Dashboard</h3>
      <div className="text-sm text-gray-500">Last 30 days</div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-blue-50 p-3 rounded">
        <div className="text-2xl font-bold text-blue-600">1,234</div>
        <div className="text-sm text-gray-600">Active Students</div>
      </div>
      <div className="bg-green-50 p-3 rounded">
        <div className="text-2xl font-bold text-green-600">89%</div>
        <div className="text-sm text-gray-600">Completion Rate</div>
      </div>
    </div>
    <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded flex items-center justify-center">
      <div className="text-white font-semibold">Chart Visualization</div>
    </div>
  </div>
);

const CourseManagementScreenshot = () => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Course Management</h3>
      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">+ New Course</button>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
        <div>
          <div className="font-medium text-gray-800">React Fundamentals</div>
          <div className="text-sm text-gray-500">45 students • 12 lessons</div>
        </div>
        <div className="text-green-600 text-sm">Active</div>
      </div>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
        <div>
          <div className="font-medium text-gray-800">JavaScript Advanced</div>
          <div className="text-sm text-gray-500">32 students • 18 lessons</div>
        </div>
        <div className="text-blue-600 text-sm">Draft</div>
      </div>
    </div>
  </div>
);

const StudentDashboardScreenshot = () => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">My Learning</h3>
      <div className="text-sm text-gray-500">Welcome back, John!</div>
    </div>
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>75%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">React Basics</span>
        </div>
        <span className="text-green-600 text-sm">✓</span>
      </div>
      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm">State Management</span>
        </div>
        <span className="text-blue-600 text-sm">In Progress</span>
      </div>
    </div>
  </div>
);

export default function ScreenshotSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const screenshots = [
    {
      id: 1,
      title: 'Interactive Code Playground',
      description: 'Multi-language code editor with live execution and collaborative features',
      component: <CodePlaygroundScreenshot />,
      features: ['20+ Programming Languages', 'Live Code Execution', 'Collaborative Coding', 'Syntax Highlighting']
    },
    {
      id: 2,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics to track student progress and engagement',
      component: <AnalyticsScreenshot />,
      features: ['Student Progress Tracking', 'Engagement Metrics', 'Course Performance', 'Real-time Reports']
    },
    {
      id: 3,
      title: 'Course Management',
      description: 'Intuitive interface for creating and managing educational content',
      component: <CourseManagementScreenshot />,
      features: ['Content Creation Tools', 'Quiz Builder', 'Video Integration', 'Progress Tracking']
    },
    {
      id: 4,
      title: 'Student Dashboard',
      description: 'Personalized learning experience with progress tracking and achievements',
      component: <StudentDashboardScreenshot />,
      features: ['Personal Learning Path', 'Achievement System', 'Progress Tracking', 'Social Features']
    }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See DCodesystems LMS
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our powerful features through interactive screenshots and see how our platform transforms education.
          </p>
        </motion.div>

        {/* Screenshot Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Screenshot Display */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    className="w-full h-auto p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {screenshots[activeSlide].component}
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <i className="ri-arrow-left-line text-xl"></i>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <i className="ri-arrow-right-line text-xl"></i>
                </button>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {screenshots[activeSlide].title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    {screenshots[activeSlide].description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-3">
                    {screenshots[activeSlide].features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <i className="ri-check-line text-green-500 mr-3 text-lg"></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-12 space-x-3">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
