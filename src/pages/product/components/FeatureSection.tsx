import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';

export default function FeatureSection() {
  const features = [
    {
      icon: 'ri-code-s-slash-line',
      title: 'Interactive Courses',
      description: 'Create engaging courses with multimedia content, quizzes, and hands-on coding exercises that keep students engaged.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'ri-bar-chart-line',
      title: 'Real-time Analytics',
      description: 'Track student progress, engagement metrics, and course performance with comprehensive analytics dashboard.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Secure Authentication',
      description: 'Enterprise-grade security with SSO, role-based access control, and data encryption to protect your content.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'ri-code-box-line',
      title: 'Multi-language Code Playground',
      description: 'Built-in code editor supporting 20+ programming languages with live execution and collaborative coding features.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: 'ri-user-settings-line',
      title: 'Easy Student Management',
      description: 'Streamlined student enrollment, progress tracking, and communication tools for effective course management.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: 'ri-smartphone-line',
      title: 'Mobile-Friendly',
      description: 'Responsive design that works perfectly on all devices, ensuring students can learn anywhere, anytime.',
      color: 'from-pink-500 to-purple-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-20 bg-white">
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
            Powerful Features for
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Learning
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, manage, and scale your educational platform with advanced tools and intuitive design.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
