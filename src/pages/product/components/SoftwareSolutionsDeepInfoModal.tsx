import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import SoftwareSolutionsAnimatedHuman from "./SoftwareSolutionsAnimatedHuman";

interface SoftwareSolutionsDeepInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export default function SoftwareSolutionsDeepInfoModal({ isOpen, onClose, category }: SoftwareSolutionsDeepInfoModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  const deepInfo = {
    "Software Solutions": {
      title: "Software Solutions",
      icon: "💻",
      description: "Comprehensive software development solutions that build, deploy, and maintain modern applications and systems.",
      tabs: [
        {
          title: "Custom Application Development",
          content: {
            overview: "Build tailored software applications that meet your specific business requirements and integrate seamlessly with existing systems.",
            features: [
              "Full-stack web and mobile application development",
              "Custom business logic and workflow automation",
              "API development and third-party integrations",
              "Cross-platform compatibility and responsive design"
            ],
            benefits: [
              "50% faster time-to-market for new applications",
              "Tailored solutions that fit your exact needs",
              "Seamless integration with existing systems",
              "Scalable architecture for future growth"
            ]
          }
        },
        {
          title: "Cloud-Native Solutions",
          content: {
            overview: "Develop and deploy applications using cloud-native technologies for maximum scalability, reliability, and performance.",
            features: [
              "Microservices architecture and containerization",
              "Cloud deployment and orchestration",
              "Auto-scaling and load balancing",
              "DevOps and CI/CD pipeline implementation"
            ],
            benefits: [
              "99.9% uptime through cloud infrastructure",
              "Automatic scaling based on demand",
              "Reduced infrastructure management overhead",
              "Enhanced security and compliance"
            ]
          }
        },
        {
          title: "Enterprise Software Integration",
          content: {
            overview: "Integrate and modernize enterprise software systems to improve efficiency and data flow across your organization.",
            features: [
              "Legacy system modernization and migration",
              "Enterprise resource planning (ERP) integration",
              "Customer relationship management (CRM) systems",
              "Data synchronization and workflow automation"
            ],
            benefits: [
              "40% improvement in operational efficiency",
              "Unified data management across departments",
              "Reduced manual processes and errors",
              "Enhanced collaboration and communication"
            ]
          }
        },
        {
          title: "Quality Assurance & Testing",
          content: {
            overview: "Comprehensive testing and quality assurance services to ensure your software meets the highest standards of reliability and performance.",
            features: [
              "Automated testing and continuous integration",
              "Performance testing and optimization",
              "Security testing and vulnerability assessment",
              "User acceptance testing and feedback integration"
            ],
            benefits: [
              "95% reduction in production bugs",
              "Faster release cycles with confidence",
              "Enhanced user experience and satisfaction",
              "Reduced maintenance and support costs"
            ]
          }
        }
      ]
    }
  };

  const currentInfo = deepInfo[category as keyof typeof deepInfo] || deepInfo["Software Solutions"];
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
            className="relative bg-gradient-to-br from-slate-900/95 to-indigo-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-6xl w-full max-h-[95vh] overflow-hidden"
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
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-code-s-slash-line text-3xl text-white"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentInfo.title}</h2>
                  <p className="text-indigo-200">{currentInfo.description}</p>
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
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
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
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 flex-shrink-0"></div>
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

              {/* Right Column - Software Solutions Animated Human & Visual */}
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
                        "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)"
                      ]
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />

                  {/* Software Solutions Animated Human Character */}
                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", damping: 10 }}
                  >
                    <SoftwareSolutionsAnimatedHuman size="lg" />
                  </motion.div>

                  {/* Floating Software Development Elements */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
                      style={{
                        left: `${10 + i * 10}%`,
                        top: `${15 + (i % 4) * 20}%`
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
                      <i className={`ri-${['code-s-slash-line', 'terminal-line', 'database-line', 'cloud-line', 'git-branch-line', 'bug-line', 'flashlight-line', 'cpu-line'][i]} text-white text-sm`}></i>
                    </motion.div>
                  ))}

                  {/* Code Flow Visualization */}
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
                        stroke="rgba(99, 102, 241, 0.4)"
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
                        stroke="rgba(168, 85, 247, 0.4)"
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
                        stroke="rgba(59, 130, 246, 0.4)"
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
                    <div className="text-white/60 text-sm">Software Development Demo</div>
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
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Development
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
