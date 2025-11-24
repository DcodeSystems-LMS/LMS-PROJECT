import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/base/Button";
import HeroSection from './components/HeroSection';

export default function ProductPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <i className="ri-code-s-slash-line text-4xl"></i>,
      title: "Interactive Code Playground",
      description: "Real-time code execution with Monaco Editor supporting Python, JavaScript, C++, Java and more",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <i className="ri-brain-line text-4xl"></i>,
      title: "AI-Powered Assessments",
      description: "Automated question generation, intelligent grading, and personalized learning paths",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <i className="ri-video-line text-4xl"></i>,
      title: "Advanced Video Learning",
      description: "YouTube integration, adaptive streaming, and progress tracking with HLS player",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <i className="ri-flashlight-line text-4xl"></i>,
      title: "Real-time Collaboration",
      description: "Live sessions, instant notifications, and seamless communication between learners and mentors",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 -left-20 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-10 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 100, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Navigation */}
      <motion.nav
        className="relative z-50 px-4 py-4 sm:px-6 sm:py-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-8 sm:py-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <img 
                  src="https://static.readdy.ai/image/9a8f01f834659f0ab66072bb9b6ee657/94d4f47a77f88d2925bb5eae1005561d.png" 
                  alt="DCodesystems" 
                  className="h-8 sm:h-10" 
                />
              </motion.div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" className="text-white hover:bg-white/10 hidden sm:flex text-sm px-3 py-2">
                  Sign In
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/50 text-sm px-4 py-2 sm:px-6 sm:py-3">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24 sm:pb-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 sm:px-6 sm:py-3">
              <i className="ri-sparkling-line text-yellow-400 text-lg sm:text-xl"></i>
              <span className="text-white text-sm sm:text-base">Production-Ready Full-Stack LMS Platform</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-4 sm:mb-6">
              DCodesystems
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6 sm:mb-8">
              LMS Platform
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-white/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The complete learning management system with interactive coding, AI assessments, 
            video learning, and real-time collaboration.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-6 py-4 sm:px-10 sm:py-7 text-base sm:text-lg shadow-2xl shadow-purple-500/50 rounded-xl w-full sm:w-auto"
            >
              <i className="ri-play-line mr-2"></i>
              Watch Demo
              <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-xl bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 px-6 py-4 sm:px-10 sm:py-7 text-base sm:text-lg rounded-xl w-full sm:w-auto"
            >
              Explore Features
            </Button>
          </motion.div>

          {/* Key Features */}
          <motion.div
            className="mb-24 sm:mb-32 mt-20 sm:mt-32"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12 sm:mb-16 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-block backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                  <span className="text-blue-300 text-sm sm:text-base">Powerful Features</span>
                </div>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
                Everything You Need to
              </h2>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Scale Education
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 px-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 h-full hover:border-white/20 transition-all duration-300">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} bg-opacity-20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl text-white mb-3 sm:mb-4">{feature.title}</h3>
                    <p className="text-white/60 text-base sm:text-lg leading-relaxed">{feature.description}</p>
                    <motion.div
                      className="flex items-center gap-2 text-purple-400 mt-4 sm:mt-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{ x: hoveredFeature === index ? 5 : 0 }}
                    >
                      <span className="text-sm sm:text-base">Learn more</span>
                      <i className="ri-arrow-right-line"></i>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
