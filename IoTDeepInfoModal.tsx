import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import IoTAnimatedHuman from "./IoTAnimatedHuman";

interface IoTDeepInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export default function IoTDeepInfoModal({ isOpen, onClose, category }: IoTDeepInfoModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  const deepInfo = {
    "IOT Solutions": {
      title: "IOT Solutions",
      icon: "🌐",
      description: "Comprehensive IoT solutions that connect, monitor, and optimize your smart devices and infrastructure.",
      tabs: [
        {
          title: "Smart Device Management",
          content: {
            overview: "Centralized management platform for all your IoT devices with real-time monitoring and control capabilities.",
            features: [
              "Unified device dashboard and control panel",
              "Real-time device status monitoring",
              "Automated device provisioning and configuration",
              "Remote device management and updates"
            ],
            benefits: [
              "50% reduction in device management time",
              "99.9% device uptime through proactive monitoring",
              "Centralized control of all smart devices",
              "Automated maintenance and updates"
            ]
          }
        },
        {
          title: "Sensor Data Analytics",
          content: {
            overview: "Advanced analytics platform that processes and analyzes data from IoT sensors to provide actionable insights.",
            features: [
              "Real-time data collection from multiple sensors",
              "Machine learning-based pattern recognition",
              "Predictive analytics and forecasting",
              "Custom dashboard and reporting tools"
            ],
            benefits: [
              "40% improvement in operational efficiency",
              "Predictive maintenance reducing downtime by 60%",
              "Data-driven decision making capabilities",
              "Cost optimization through smart analytics"
            ]
          }
        },
        {
          title: "Smart Home Automation",
          content: {
            overview: "Complete smart home solution that automates lighting, security, climate control, and energy management.",
            features: [
              "Intelligent lighting and climate control",
              "Security system integration and monitoring",
              "Energy usage optimization and management",
              "Voice and mobile app control interfaces"
            ],
            benefits: [
              "30% reduction in energy consumption",
              "Enhanced home security and safety",
              "Convenient automation of daily tasks",
              "Remote monitoring and control capabilities"
            ]
          }
        },
        {
          title: "Industrial IoT Integration",
          content: {
            overview: "Enterprise-grade IoT solutions for industrial environments with robust connectivity and data processing.",
            features: [
              "Industrial sensor network deployment",
              "Real-time production monitoring",
              "Predictive maintenance for machinery",
              "Supply chain optimization and tracking"
            ],
            benefits: [
              "25% increase in production efficiency",
              "Reduced equipment downtime through predictive maintenance",
              "Optimized supply chain management",
              "Enhanced workplace safety monitoring"
            ]
          }
        }
      ]
    }
  };

  const currentInfo = deepInfo[category as keyof typeof deepInfo] || deepInfo["IOT Solutions"];
  const currentTab = currentInfo.tabs[activeTab];

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
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-6xl w-full max-h-[95vh] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-wifi-line text-3xl text-white"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentInfo.title}</h2>
                  <p className="text-blue-200">{currentInfo.description}</p>
                </div>
              </div>
              
              <motion.button
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="ri-close-line text-xl"></i>
              </motion.button>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
              className="flex flex-wrap gap-2 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentInfo.tabs.map((tab, index) => (
                <motion.button
                  key={index}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === index
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                  onClick={() => setActiveTab(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.title}
                </motion.button>
              ))}
            </motion.div>

            {/* Content Area */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Text Content */}
              <motion.div
                key={activeTab}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-4">{currentTab.title}</h3>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  {currentTab.content.overview}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                  <div className="space-y-2">
                    {currentTab.content.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-white/90">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Business Benefits</h4>
                  <div className="space-y-2">
                    {currentTab.content.benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-white/90">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right Column - IoT Animated Human & Visual */}
              <motion.div
                className="relative"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 h-96 flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Animated Background */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      background: [
                        "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)"
                      ]
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />

                  {/* IoT Animated Human Character */}
                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", damping: 10 }}
                  >
                    <IoTAnimatedHuman size="lg" />
                  </motion.div>

                  {/* Floating IoT Devices */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
                      style={{
                        left: `${10 + i * 12}%`,
                        top: `${15 + (i % 3) * 25}%`
                      }}
                      animate={{
                        y: [0, -15, 0],
                        rotate: [0, 5, 0],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    >
                      <i className={`ri-${['smartphone-line', 'wifi-line', 'home-line', 'cpu-line', 'flashlight-line', 'database-line'][i]} text-white text-sm`}></i>
                    </motion.div>
                  ))}

                  {/* Network Connection Lines */}
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <svg className="w-full h-full">
                      <motion.line
                        x1="20%"
                        y1="30%"
                        x2="80%"
                        y2="70%"
                        stroke="rgba(34, 197, 94, 0.4)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1.2 }}
                      />
                      <motion.line
                        x1="80%"
                        y1="30%"
                        x2="20%"
                        y2="70%"
                        stroke="rgba(59, 130, 246, 0.4)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1.5 }}
                      />
                      <motion.line
                        x1="50%"
                        y1="20%"
                        x2="50%"
                        y2="80%"
                        stroke="rgba(6, 182, 212, 0.4)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1.8 }}
                      />
                    </svg>
                  </motion.div>

                  {/* Interactive Demo Label */}
                  <motion.div
                    className="absolute bottom-4 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    <div className="text-white/60 text-sm">IoT Device Management Demo</div>
                    <div className="text-white/40 text-xs">Powered by DCode Platform</div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Footer Actions */}
            <motion.div
              className="flex justify-end space-x-4 mt-8 pt-6 border-t border-white/10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start IoT Implementation
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
