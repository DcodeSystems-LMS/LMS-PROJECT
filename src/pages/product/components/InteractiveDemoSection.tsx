import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import CodePlaygroundAnimation from "./CodePlaygroundAnimation";
import AIAssessmentAnimation from "./AIAssessmentAnimation";
import VideoLearningAnimation from "./VideoLearningAnimation";
import RealTimeCollaborationAnimation from "./RealTimeCollaborationAnimation";

interface InteractiveDemoSectionProps {
  className?: string;
}

export default function InteractiveDemoSection({ className = "" }: InteractiveDemoSectionProps) {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const demos = [
    {
      id: "code-playground",
      title: "Interactive Code Playground",
      description: "Experience real-time code execution with syntax highlighting and debugging",
      icon: "ri-code-s-slash-line",
      color: "from-blue-500 to-cyan-500",
      component: CodePlaygroundAnimation
    },
    {
      id: "ai-assessment",
      title: "AI-Powered Assessments",
      description: "Intelligent question generation and automated grading system",
      icon: "ri-brain-line",
      color: "from-purple-500 to-pink-500",
      component: AIAssessmentAnimation
    },
    {
      id: "video-learning",
      title: "Advanced Video Learning",
      description: "YouTube integration with adaptive streaming and progress tracking",
      icon: "ri-video-line",
      color: "from-orange-500 to-red-500",
      component: VideoLearningAnimation
    },
    {
      id: "real-time-collab",
      title: "Real-time Collaboration",
      description: "Live sessions with instant notifications and seamless communication",
      icon: "ri-flashlight-line",
      color: "from-green-500 to-emerald-500",
      component: RealTimeCollaborationAnimation
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demos.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentDemo = demos[activeDemo];
  const DemoComponent = currentDemo.component;

  return (
    <div className={`relative ${className}`}>
      {/* Demo Container */}
      <motion.div
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentDemo.color} flex items-center justify-center`}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <i className={`${currentDemo.icon} text-white text-xl`}></i>
            </motion.div>
            <div>
              <h3 className="text-white font-semibold text-lg">{currentDemo.title}</h3>
              <p className="text-slate-300 text-sm">{currentDemo.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
              onClick={() => setIsFullscreen(!isFullscreen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className={`text-sm ${isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}`}></i>
            </motion.button>
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Demo Navigation */}
        <div className="bg-slate-700 px-6 py-3 flex gap-2 overflow-x-auto">
          {demos.map((demo, index) => (
            <motion.button
              key={demo.id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeDemo === index
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              onClick={() => setActiveDemo(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className={demo.icon}></i>
              <span>{demo.title}</span>
            </motion.button>
          ))}
        </div>

        {/* Demo Content */}
        <motion.div
          key={activeDemo}
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`${isFullscreen ? 'h-screen' : 'h-96'} rounded-lg overflow-hidden`}>
            <DemoComponent className="h-full" />
          </div>
        </motion.div>

        {/* Demo Stats */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div
              className="flex items-center gap-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <i className="ri-eye-line text-blue-400"></i>
              <span className="text-blue-400 text-sm">Live Demo</span>
            </motion.div>
            <div className="flex items-center gap-2">
              <i className="ri-time-line text-green-400"></i>
              <span className="text-green-400 text-sm">Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-flashlight-line text-purple-400"></i>
              <span className="text-purple-400 text-sm">Interactive</span>
            </div>
          </div>
          
          <motion.div
            className="flex items-center gap-2 text-slate-400 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <i className="ri-information-line"></i>
            <span>Try interacting with the demo above</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Demo Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-slate-400/20"
            style={{
              left: `${5 + i * 10}%`,
              top: `${10 + (i % 4) * 25}%`
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, 0],
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8
            }}
          >
            <i className={`ri-${['code-s-slash-line', 'brain-line', 'video-line', 'flashlight-line', 'cpu-line', 'database-line', 'cloud-line', 'shield-line', 'rocket-line', 'star-line'][i]} text-2xl`}></i>
          </motion.div>
        ))}
      </div>

      {/* Demo Flow Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {[...Array(8)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${10 + i * 12} ${20} Q ${30} ${40} ${50 + i * 5} ${60} T ${90 - i * 5} ${80}`}
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
                repeatDelay: 4
              }}
            />
          ))}
        </svg>
      </div>

      {/* Interactive Hover Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300"
        whileHover={{ 
          background: "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
        }}
      />
    </div>
  );
}
