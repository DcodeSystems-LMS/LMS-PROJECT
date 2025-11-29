
import Card from '@/components/base/Card';
import { motion } from 'framer-motion';

const features = [
  {
    icon: 'ri-code-s-slash-line',
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with years of real-world experience in top tech companies.',
    color: 'text-brand-primary'
  },
  {
    icon: 'ri-user-star-line',
    title: 'Personal Mentorship',
    description: 'Get one-on-one guidance from dedicated mentors who care about your success and career growth.',
    color: 'text-brand-accent'
  },
  {
    icon: 'ri-trophy-line',
    title: 'Job Placement',
    description: 'Our career services team helps you land your dream job with interview prep and industry connections.',
    color: 'text-brand-primary'
  },
  {
    icon: 'ri-team-line',
    title: 'Community Support',
    description: 'Join a vibrant community of learners, share projects, and collaborate on exciting challenges.',
    color: 'text-brand-accent'
  },
  {
    icon: 'ri-award-line',
    title: 'Industry Certifications',
    description: 'Earn recognized certifications that validate your skills and boost your professional credibility.',
    color: 'text-purple-600'
  },
  {
    icon: 'ri-rocket-line',
    title: 'Career Acceleration',
    description: 'Fast-track your career with intensive programs designed to make you job-ready in months.',
    color: 'text-brand-accent'
  }
];

export default function Features() {
  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden bg-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-white">
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -80, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-300/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(251, 146, 60, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(251, 146, 60, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-primary mb-3 sm:mb-4">
            Why Choose DCODE?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We combine cutting-edge curriculum with personalized support to accelerate your coding journey
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            // Special styling for Industry Certifications
            const isCertification = feature.title === 'Industry Certifications';
            return (
              <Card
                key={index}
                variant="feature"
                className="text-center group cursor-pointer"
                hover
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCertification 
                    ? 'bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-orange-300' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-orange-100'
                }`}>
                  <i className={`${feature.icon} text-2xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}></i>
                </div>
                <h3 className="heading-tertiary text-gray-900 mb-4 group-hover:text-brand-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-body text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16 px-4">
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Ready to Transform Your Career?</h3>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of successful developers who started their journey with DCODE
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105">
                View Success Stories
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
              <button className="bg-white text-purple-600 hover:bg-gray-50 px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105">
                Start Free Trial
                <i className="ri-play-circle-line ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
