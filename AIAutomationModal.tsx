import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import DeepInfoModal from "./DeepInfoModal";

interface AIAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAutomationModal({ isOpen, onClose }: AIAutomationModalProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [isDeepInfoOpen, setIsDeepInfoOpen] = useState(false);

  const sections = [
    {
      title: "Intelligent Process Automation",
      icon: "🤖",
      description: "Transform your workflows with AI-driven automation that learns and adapts to your business needs.",
      features: [
        "Smart workflow orchestration",
        "Predictive task scheduling",
        "Automated decision making",
        "Self-healing processes"
      ]
    },
    {
      title: "Machine Learning Integration",
      icon: "🧠",
      description: "Leverage advanced ML algorithms to analyze patterns and optimize operations automatically.",
      features: [
        "Pattern recognition and analysis",
        "Predictive maintenance",
        "Anomaly detection",
        "Continuous learning models"
      ]
    },
    {
      title: "Natural Language Processing",
      icon: "💬",
      description: "Enable intelligent communication and document processing through advanced NLP capabilities.",
      features: [
        "Automated document analysis",
        "Intelligent chatbots",
        "Sentiment analysis",
        "Language translation"
      ]
    },
    {
      title: "Computer Vision Solutions",
      icon: "👁️",
      description: "Implement visual intelligence for quality control, monitoring, and automated visual tasks.",
      features: [
        "Image recognition and classification",
        "Object detection and tracking",
        "Quality assurance automation",
        "Visual data extraction"
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-robot-line text-3xl text-white"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">AI Powered Automation</h2>
                  <p className="text-purple-200">Revolutionary automation solutions for modern businesses</p>
                </div>
              </motion.div>
              
              <motion.button
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <i className="ri-close-line text-xl"></i>
              </motion.button>
            </div>

            {/* Navigation Tabs */}
            <motion.div
              className="flex space-x-2 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {sections.map((section, index) => (
                <motion.button
                  key={index}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeSection === index
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                  onClick={() => setActiveSection(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {section.icon} {section.title}
                </motion.button>
              ))}
            </motion.div>

            {/* Content Area */}
            <motion.div
              className="relative"
              key={activeSection}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Description */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="text-3xl mr-3">{sections[activeSection].icon}</span>
                    {sections[activeSection].title}
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed mb-6">
                    {sections[activeSection].description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-3">
                    {sections[activeSection].features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                        <span className="text-white/90">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Right Column - Visual Elements */}
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 h-80 flex items-center justify-center relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
                          "radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
                          "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)"
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    
                    {/* Floating Icons */}
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"
                        style={{
                          left: `${20 + i * 20}%`,
                          top: `${30 + (i % 2) * 40}%`
                        }}
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 5, 0]
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      >
                        <i className={`ri-${['robot-line', 'brain-line', 'cpu-line', 'flashlight-line'][i]} text-xl text-white`}></i>
                      </motion.div>
                    ))}
                    
                    {/* Central Content */}
                    <motion.div
                      className="text-center z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", damping: 10 }}
                    >
                      <div className="text-6xl mb-4">{sections[activeSection].icon}</div>
                      <div className="text-white/60 text-sm">Interactive Demo</div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Footer Actions */}
            <motion.div
              className="flex justify-end space-x-4 mt-8 pt-6 border-t border-white/10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                onClick={() => setIsDeepInfoOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Deep Info Modal */}
      <DeepInfoModal
        isOpen={isDeepInfoOpen}
        onClose={() => setIsDeepInfoOpen(false)}
        category={sections[activeSection].title}
      />
    </AnimatePresence>
  );
}
