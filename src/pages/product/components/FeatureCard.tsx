import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export default function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
      whileHover={{ 
        y: -5,
        scale: 1.02
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${color} mb-6`}>
        <i className={`${icon} text-3xl text-white`}></i>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
