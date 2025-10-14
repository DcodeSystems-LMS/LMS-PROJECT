import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-4xl text-blue-400/20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <i className="ri-rocket-line"></i>
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-3xl text-purple-400/20"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <i className="ri-trophy-line"></i>
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-1/4 text-5xl text-orange-400/20"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <i className="ri-graduation-cap-line"></i>
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-1/3 text-4xl text-cyan-400/20"
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <i className="ri-code-s-slash-line"></i>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to Transform
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                Your Learning Experience?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join thousands of educators and organizations who are already using DCodesystems LMS 
              to create engaging, interactive learning experiences.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link to="/auth/signin">
              <Button 
                size="lg" 
                className="px-10 py-5 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <i className="ri-rocket-line mr-3"></i>
                Request Demo
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button 
                variant="secondary" 
                size="lg"
                className="px-10 py-5 text-xl font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                <i className="ri-user-add-line mr-3"></i>
                Get Started Free
              </Button>
            </Link>
          </motion.div>

          {/* Features List */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-blue-500/20 mb-4">
                <i className="ri-shield-check-line text-3xl text-blue-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure & Reliable</h3>
              <p className="text-gray-300">Enterprise-grade security with 99.9% uptime guarantee</p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-purple-500/20 mb-4">
                <i className="ri-customer-service-line text-3xl text-purple-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24/7 Support</h3>
              <p className="text-gray-300">Dedicated support team to help you succeed</p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-4 rounded-xl bg-orange-500/20 mb-4">
                <i className="ri-rocket-line text-3xl text-orange-400"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Easy Setup</h3>
              <p className="text-gray-300">Get started in minutes with our intuitive setup process</p>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 mb-8">Trusted by 10,000+ organizations worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-300">Microsoft</div>
              <div className="text-2xl font-bold text-gray-300">Google</div>
              <div className="text-2xl font-bold text-gray-300">Amazon</div>
              <div className="text-2xl font-bold text-gray-300">IBM</div>
              <div className="text-2xl font-bold text-gray-300">Oracle</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
