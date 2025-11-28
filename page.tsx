import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/base/Button";
import HeroSection from './components/HeroSection';
import CodePlaygroundAnimation from './components/CodePlaygroundAnimation';
import AIAssessmentAnimation from './components/AIAssessmentAnimation';
import VideoLearningAnimation from './components/VideoLearningAnimation';
import RealTimeCollaborationAnimation from './components/RealTimeCollaborationAnimation';
import TechStackAnimation from './components/TechStackAnimation';
import InteractiveDemoSection from './components/InteractiveDemoSection';
import AIAutomationModal from './components/AIAutomationModal';
import IoTDeepInfoModal from './components/IoTDeepInfoModal';
import DataAnalyticsDeepInfoModal from './components/DataAnalyticsDeepInfoModal';
import SoftwareSolutionsDeepInfoModal from './components/SoftwareSolutionsDeepInfoModal';

export default function ProductPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isIoTModalOpen, setIsIoTModalOpen] = useState(false);
  const [isDataAnalyticsModalOpen, setIsDataAnalyticsModalOpen] = useState(false);
  const [isSoftwareSolutionsModalOpen, setIsSoftwareSolutionsModalOpen] = useState(false);


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

  const techStack = [
    {
      category: "Frontend",
      icon: "💻",
      items: ["React 18", "TypeScript", "Vite + SWC", "TailwindCSS"]
    },
    {
      category: "Backend & Database",
      icon: "🔥",
      items: ["Supabase", "PostgreSQL", "Row Level Security", "Real-time Subscriptions"]
    },
    {
      category: "Key Integrations",
      icon: "🔌",
      items: ["Monaco Editor", "Judge0 API", "HLS.js Player", "YouTube API"]
    },
    {
      category: "Features",
      icon: "✨",
      items: ["AI Generation", "i18n Support", "PWA Ready", "Dark Mode"]
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

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-16 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              { 
                icon: <i className="ri-robot-line text-xl sm:text-2xl"></i>, 
                value: "AI Powered", 
                label: "Automation",
                clickable: true,
                onClick: () => setIsAIModalOpen(true)
              },
              { 
                icon: <i className="ri-wifi-line text-xl sm:text-2xl"></i>, 
                value: "IOT", 
                label: "Solutions",
                clickable: true,
                onClick: () => setIsIoTModalOpen(true)
              },
              { 
                icon: <i className="ri-bar-chart-line text-xl sm:text-2xl"></i>, 
                value: "Data", 
                label: "Analytics",
                clickable: true,
                onClick: () => setIsDataAnalyticsModalOpen(true)
              },
              { 
                icon: <i className="ri-code-s-slash-line text-xl sm:text-2xl"></i>, 
                value: "Software", 
                label: "Solutions",
                clickable: true,
                onClick: () => setIsSoftwareSolutionsModalOpen(true)
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 ${
                  stat.clickable ? 'cursor-pointer hover:bg-white/10' : ''
                }`}
                whileHover={stat.clickable ? { y: -5, borderColor: "rgba(255, 255, 255, 0.2)", scale: 1.02 } : { y: -5, borderColor: "rgba(255, 255, 255, 0.2)" }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={stat.clickable ? stat.onClick : undefined}
                whileTap={stat.clickable ? { scale: 0.98 } : undefined}
              >
                <div className="text-purple-400 flex justify-center mb-2 sm:mb-3">{stat.icon}</div>
                <div className="text-2xl sm:text-4xl text-white mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
                {stat.clickable && (
                  <div className="text-xs text-purple-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to learn more
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

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
                  <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-4">{feature.description}</p>
                  
                  {/* Interactive Demo Preview */}
                  <div className="mb-4 h-32 bg-white/5 rounded-lg overflow-hidden">
                    {index === 0 && <CodePlaygroundAnimation className="h-full" />}
                    {index === 1 && <AIAssessmentAnimation className="h-full" />}
                    {index === 2 && <VideoLearningAnimation className="h-full" />}
                    {index === 3 && <RealTimeCollaborationAnimation className="h-full" />}
                  </div>
                  
                  <motion.div
                    className="flex items-center gap-2 text-purple-400 mt-4 sm:mt-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: hoveredFeature === index ? 5 : 0 }}
                  >
                    <span className="text-sm sm:text-base">Try interactive demo</span>
                    <i className="ri-arrow-right-line"></i>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-pink-300 text-sm sm:text-base">Technology Stack</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Built with
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Modern Technologies
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Production-ready with React 18, TypeScript, Supabase, and enterprise-grade integrations
            </p>
          </div>

          {/* Interactive Tech Stack Animation */}
          <div className="max-w-4xl mx-auto px-4">
            <TechStackAnimation className="h-96" />
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          className="mb-24 sm:mb-32 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-white/10 rounded-3xl p-8 sm:p-12 md:p-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="ri-shield-check-line text-2xl sm:text-3xl text-blue-400"></i>
                </div>
                <h3 className="text-xl sm:text-2xl text-white mb-2 sm:mb-3">Enterprise Security</h3>
                <p className="text-white/60 text-sm sm:text-base">Row-level security with Supabase Auth and encrypted data storage</p>
              </div>
              <div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="ri-flashlight-line text-2xl sm:text-3xl text-purple-400"></i>
                </div>
                <h3 className="text-xl sm:text-2xl text-white mb-2 sm:mb-3">Lightning Fast</h3>
                <p className="text-white/60 text-sm sm:text-base">Built with Vite and SWC for optimal performance and speed</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <i className="ri-smartphone-line text-2xl sm:text-3xl text-pink-400"></i>
                </div>
                <h3 className="text-xl sm:text-2xl text-white mb-2 sm:mb-3">Fully Responsive</h3>
                <p className="text-white/60 text-sm sm:text-base">Seamless experience across all devices with PWA support</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Platform Screenshots */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-green-300 text-sm sm:text-base">Platform Preview</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              See It In Action
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Platform Screenshots
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Explore our intuitive interface designed for modern learning experiences
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
            {[
              {
                title: "Student Dashboard",
                description: "Clean, organized interface for course progress and assignments",
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Code Playground",
                description: "Real-time code execution with syntax highlighting and debugging",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "Assessment Builder",
                description: "Create interactive quizzes and coding challenges with AI assistance",
                image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((screenshot, index) => (
              <motion.div
                key={screenshot.title}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative overflow-hidden rounded-2xl mb-3 sm:mb-4">
                  <img 
                    src={screenshot.image} 
                    alt={screenshot.title}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${screenshot.gradient} opacity-20`}></div>
                </div>
                <h3 className="text-lg sm:text-xl text-white mb-2">{screenshot.title}</h3>
                <p className="text-white/60 text-sm sm:text-base">{screenshot.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-yellow-300 text-sm sm:text-base">Pricing Plans</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Choose Your Plan
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Flexible Pricing
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-4">
            {[
              {
                name: "Free",
                price: "₹0",
                period: "forever",
                description: "Perfect for individual learners",
                features: [
                  "Up to 5 courses",
                  "Basic assessments",
                  "Community support",
                  "Mobile app access",
                  "Basic analytics"
                ],
                cta: "Get Started Free",
                popular: false,
                gradient: "from-gray-500 to-gray-600"
              },
              {
                name: "Pro",
                price: "₹2,399",
                period: "per month",
                description: "Ideal for instructors and small teams",
                features: [
                  "Unlimited courses",
                  "Advanced assessments",
                  "AI-powered features",
                  "Priority support",
                  "Advanced analytics",
                  "Custom branding",
                  "API access"
                ],
                cta: "Start Pro Trial",
                popular: true,
                gradient: "from-blue-500 to-purple-600"
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "contact us",
                description: "For large organizations and institutions",
                features: [
                  "Everything in Pro",
                  "White-label solution",
                  "SSO integration",
                  "Dedicated support",
                  "Custom integrations",
                  "Advanced security",
                  "SLA guarantee"
                ],
                cta: "Contact Sales",
                popular: false,
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative backdrop-blur-xl bg-white/5 border rounded-3xl p-6 sm:p-8 ${
                  plan.popular 
                    ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10' 
                    : 'border-white/10 hover:border-white/20'
                } transition-all duration-300`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 sm:px-4 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {plan.price}
                    <span className="text-base sm:text-lg text-white/60">/{plan.period}</span>
                  </div>
                  <p className="text-white/60 text-sm sm:text-base">{plan.description}</p>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 sm:gap-3 text-white/70 text-sm sm:text-base">
                      <i className="ri-check-line text-green-400 flex-shrink-0 text-sm"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full text-sm sm:text-base ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                  } text-white border-0`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Customer Testimonials */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-cyan-300 text-sm sm:text-base">Customer Stories</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Loved by Educators
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Join thousands of satisfied educators and students who trust our platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Computer Science Professor",
                university: "Stanford University",
                content: "The interactive code playground has revolutionized how I teach programming. Students can now practice in real-time with instant feedback.",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
              },
              {
                name: "Michael Chen",
                role: "Bootcamp Instructor",
                university: "Tech Academy",
                content: "The AI-powered assessment system saves me hours of grading time while providing detailed analytics on student performance.",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              },
              {
                name: "Emily Rodriguez",
                role: "Online Learning Director",
                university: "Global Education Institute",
                content: "The platform's scalability and reliability have been game-changers for our online programs. Highly recommended!",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-yellow-400 text-sm sm:text-base"></i>
                  ))}
                </div>
                <p className="text-white/80 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.content}"</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-white font-medium text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-white/60 text-xs sm:text-sm">{testimonial.role}</div>
                    <div className="text-white/40 text-xs sm:text-sm">{testimonial.university}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-indigo-300 text-sm sm:text-base">Frequently Asked</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Common Questions
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Answered
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4">
            {[
              {
                question: "How quickly can I get started with the platform?",
                answer: "You can start using our platform immediately after signing up. Our intuitive interface and comprehensive onboarding process will have you creating your first course within minutes."
              },
              {
                question: "Do you offer integration with existing learning management systems?",
                answer: "Yes! We support LTI (Learning Tools Interoperability), SCORM compliance, and custom API integrations. Our platform seamlessly integrates with most major LMS platforms."
              },
              {
                question: "What kind of support do you provide?",
                answer: "We offer 24/7 support for all users, with priority support for Pro and Enterprise customers. Our support includes live chat, email support, and comprehensive documentation."
              },
              {
                question: "Is my data secure on your platform?",
                answer: "Absolutely. We use enterprise-grade security with SOC 2 compliance, GDPR compliance, end-to-end encryption, and regular security audits. Your data is protected with the highest industry standards."
              },
              {
                question: "Can I customize the platform to match my brand?",
                answer: "Yes! Pro and Enterprise plans include custom branding options, white-label solutions, and the ability to customize the interface to match your organization's brand guidelines."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-lg sm:text-xl text-white mb-2 sm:mb-3">{faq.question}</h3>
                <p className="text-white/70 text-sm sm:text-base">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Demo Section */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-emerald-300 text-sm sm:text-base">Live Interactive Demo</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Experience the Platform
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Interactive Preview
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Try our platform features in real-time. Switch between different demos to explore all capabilities.
            </p>
          </div>

          {/* Interactive Demo Container */}
          <div className="max-w-6xl mx-auto px-4">
            <InteractiveDemoSection className="h-[600px]" />
          </div>
        </motion.div>

        {/* Use Cases & Industries */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-violet-300 text-sm sm:text-base">Use Cases</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Perfect for Every
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Learning Environment
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              From universities to corporate training, we serve all educational needs
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
            {[
              {
                title: "Higher Education",
                description: "Universities and colleges worldwide",
                icon: <i className="ri-graduation-cap-line text-3xl"></i>,
                gradient: "from-blue-500 to-indigo-500",
                features: ["Course Management", "Student Analytics", "Grade Management", "Academic Integrity"]
              },
              {
                title: "Corporate Training",
                description: "Employee development and onboarding",
                icon: <i className="ri-building-line text-3xl"></i>,
                gradient: "from-purple-500 to-pink-500",
                features: ["Skills Assessment", "Progress Tracking", "Certification", "Team Collaboration"]
              },
              {
                title: "Coding Bootcamps",
                description: "Intensive programming education",
                icon: <i className="ri-code-box-line text-3xl"></i>,
                gradient: "from-orange-500 to-red-500",
                features: ["Live Coding", "Project Portfolio", "Peer Review", "Job Placement"]
              },
              {
                title: "K-12 Education",
                description: "Primary and secondary schools",
                icon: <i className="ri-school-line text-3xl"></i>,
                gradient: "from-green-500 to-teal-500",
                features: ["Parent Portal", "Grade Book", "Attendance", "Curriculum Management"]
              },
              {
                title: "Professional Development",
                description: "Continuing education and certifications",
                icon: <i className="ri-award-line text-3xl"></i>,
                gradient: "from-cyan-500 to-blue-500",
                features: ["Skill Assessment", "Certification Tracking", "CE Credits", "Professional Network"]
              },
              {
                title: "Online Academies",
                description: "Digital learning institutions",
                icon: <i className="ri-global-line text-3xl"></i>,
                gradient: "from-pink-500 to-rose-500",
                features: ["Global Reach", "Multi-language", "Cultural Adaptation", "Scalable Infrastructure"]
              }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.gradient} bg-opacity-20 flex items-center justify-center mx-auto mb-4`}>
                  <div className="text-white">{useCase.icon}</div>
                </div>
                <h3 className="text-xl text-white mb-2 text-center">{useCase.title}</h3>
                <p className="text-white/60 text-center mb-4 text-sm">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                      <i className="ri-check-line text-green-400 flex-shrink-0 text-xs"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security & Compliance */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-red-300 text-sm sm:text-base">Security & Compliance</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Enterprise-Grade
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Security & Trust
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Your data is protected with industry-leading security standards
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
            {[
              {
                title: "SOC 2 Type II",
                description: "Audited security controls and processes",
                icon: <i className="ri-shield-check-line text-3xl"></i>,
                gradient: "from-green-500 to-emerald-500"
              },
              {
                title: "GDPR Compliant",
                description: "Full compliance with EU data protection laws",
                icon: <i className="ri-global-line text-3xl"></i>,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "End-to-End Encryption",
                description: "256-bit encryption for all data transmission",
                icon: <i className="ri-lock-line text-3xl"></i>,
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "ISO 27001",
                description: "International information security standard",
                icon: <i className="ri-award-line text-3xl"></i>,
                gradient: "from-orange-500 to-red-500"
              },
              {
                title: "HIPAA Ready",
                description: "Healthcare data protection compliance",
                icon: <i className="ri-heart-pulse-line text-3xl"></i>,
                gradient: "from-pink-500 to-rose-500"
              },
              {
                title: "99.9% Uptime SLA",
                description: "Guaranteed service availability",
                icon: <i className="ri-time-line text-3xl"></i>,
                gradient: "from-cyan-500 to-blue-500"
              }
            ].map((security, index) => (
              <motion.div
                key={security.title}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${security.gradient} bg-opacity-20 flex items-center justify-center mx-auto mb-4`}>
                  <div className="text-white">{security.icon}</div>
                </div>
                <h3 className="text-xl text-white mb-2 text-center">{security.title}</h3>
                <p className="text-white/60 text-center text-sm">{security.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Integration Capabilities */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-teal-300 text-sm sm:text-base">Integrations</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Seamless
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Integrations
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Connect with your existing tools and workflows
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
            {[
              { name: "Zoom", icon: "📹", category: "Video Conferencing" },
              { name: "Microsoft Teams", icon: "💼", category: "Collaboration" },
              { name: "Google Workspace", icon: "🔗", category: "Productivity" },
              { name: "Slack", icon: "💬", category: "Communication" },
              { name: "Salesforce", icon: "☁️", category: "CRM" },
              { name: "Moodle", icon: "🎓", category: "LMS" },
              { name: "Canvas", icon: "📚", category: "LMS" },
              { name: "Blackboard", icon: "⚫", category: "LMS" }
            ].map((integration, index) => (
              <motion.div
                key={integration.name}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="text-4xl mb-3">{integration.icon}</div>
                <h3 className="text-lg text-white mb-1">{integration.name}</h3>
                <p className="text-white/60 text-sm">{integration.category}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mobile App Section */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-indigo-300 text-sm sm:text-base">Mobile Apps</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              Learn Anywhere
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Mobile Experience
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Native mobile apps for iOS and Android with offline capabilities
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 px-4">
            <motion.div
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-20 flex items-center justify-center">
                  <i className="ri-smartphone-line text-3xl text-blue-400"></i>
                </div>
                <div>
                  <h3 className="text-2xl text-white">iOS App</h3>
                  <p className="text-white/60">Available on App Store</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Offline course downloads",
                  "Push notifications",
                  "Touch ID / Face ID",
                  "Dark mode support",
                  "Background sync"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <i className="ri-check-line text-green-400 flex-shrink-0"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 bg-opacity-20 flex items-center justify-center">
                  <i className="ri-android-line text-3xl text-green-400"></i>
                </div>
                <div>
                  <h3 className="text-2xl text-white">Android App</h3>
                  <p className="text-white/60">Available on Google Play</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Offline course downloads",
                  "Push notifications",
                  "Fingerprint authentication",
                  "Material Design",
                  "Background sync"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <i className="ri-check-line text-green-400 flex-shrink-0"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact & Support */}
        <motion.div
          className="mb-24 sm:mb-32"
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
              <div className="inline-block backdrop-blur-sm bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6">
                <span className="text-amber-300 text-sm sm:text-base">Support</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-3 sm:mb-4">
              We're Here to
            </h2>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Help You Succeed
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
              Get the support you need with our comprehensive help resources
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
            {[
              {
                title: "Live Chat",
                description: "24/7 instant support",
                icon: <i className="ri-chat-3-line text-3xl"></i>,
                gradient: "from-blue-500 to-cyan-500",
                availability: "24/7"
              },
              {
                title: "Email Support",
                description: "Detailed technical assistance",
                icon: <i className="ri-mail-line text-3xl"></i>,
                gradient: "from-purple-500 to-pink-500",
                availability: "24 hours"
              },
              {
                title: "Phone Support",
                description: "Direct voice assistance",
                icon: <i className="ri-phone-line text-3xl"></i>,
                gradient: "from-green-500 to-emerald-500",
                availability: "Business hours"
              },
              {
                title: "Video Tutorials",
                description: "Step-by-step guides",
                icon: <i className="ri-video-line text-3xl"></i>,
                gradient: "from-orange-500 to-red-500",
                availability: "On-demand"
              }
            ].map((support, index) => (
              <motion.div
                key={support.title}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${support.gradient} bg-opacity-20 flex items-center justify-center mx-auto mb-4`}>
                  <div className="text-white">{support.icon}</div>
                </div>
                <h3 className="text-xl text-white mb-2 text-center">{support.title}</h3>
                <p className="text-white/60 text-center mb-2 text-sm">{support.description}</p>
                <p className="text-green-400 text-center text-xs font-medium">{support.availability}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-8 sm:p-12 md:p-16">
            <i className="ri-sparkling-line text-4xl sm:text-6xl text-yellow-400 mx-auto mb-4 sm:mb-6 block"></i>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 sm:mb-6">
              Ready to Transform Learning?
            </h2>
            <p className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of educators and students already using our platform
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 sm:px-12 sm:py-7 text-base sm:text-lg shadow-2xl shadow-purple-500/50 rounded-xl w-full sm:w-auto"
              >
                Start Free Trial
                <i className="ri-arrow-right-line ml-2"></i>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="backdrop-blur-xl bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 sm:px-12 sm:py-7 text-base sm:text-lg rounded-xl w-full sm:w-auto"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Automation Modal */}
      <AIAutomationModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />

      {/* IoT Solutions Modal */}
      <IoTDeepInfoModal 
        isOpen={isIoTModalOpen} 
        onClose={() => setIsIoTModalOpen(false)} 
        category="IOT Solutions"
      />

      {/* Data Analytics Modal */}
      <DataAnalyticsDeepInfoModal 
        isOpen={isDataAnalyticsModalOpen} 
        onClose={() => setIsDataAnalyticsModalOpen(false)} 
        category="Data Analytics"
      />

      {/* Software Solutions Modal */}
      <SoftwareSolutionsDeepInfoModal 
        isOpen={isSoftwareSolutionsModalOpen} 
        onClose={() => setIsSoftwareSolutionsModalOpen(false)} 
        category="Software Solutions"
      />
    </div>
  );
}
