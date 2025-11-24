import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface TechStackAnimationProps {
  className?: string;
}

export default function TechStackAnimation({ className = "" }: TechStackAnimationProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const techCategories = [
    {
      category: "Frontend",
      icon: "💻",
      color: "from-blue-500 to-cyan-500",
      items: [
        { name: "React 18", icon: "⚛️", description: "Latest React with concurrent features" },
        { name: "TypeScript", icon: "🔷", description: "Type-safe JavaScript development" },
        { name: "Vite + SWC", icon: "⚡", description: "Lightning-fast build tooling" },
        { name: "TailwindCSS", icon: "🎨", description: "Utility-first CSS framework" }
      ]
    },
    {
      category: "Backend & Database",
      icon: "🔥",
      color: "from-orange-500 to-red-500",
      items: [
        { name: "Supabase", icon: "🚀", description: "Open source Firebase alternative" },
        { name: "PostgreSQL", icon: "🐘", description: "Advanced open source database" },
        { name: "Row Level Security", icon: "🔒", description: "Database-level security policies" },
        { name: "Real-time Subscriptions", icon: "⚡", description: "Live data synchronization" }
      ]
    },
    {
      category: "Key Integrations",
      icon: "🔌",
      color: "from-purple-500 to-pink-500",
      items: [
        { name: "Monaco Editor", icon: "📝", description: "VS Code editor in the browser" },
        { name: "Judge0 API", icon: "⚖️", description: "Code execution and evaluation" },
        { name: "HLS.js Player", icon: "🎬", description: "Advanced video streaming" },
        { name: "YouTube API", icon: "📺", description: "YouTube integration and analytics" }
      ]
    },
    {
      category: "Features",
      icon: "✨",
      color: "from-green-500 to-emerald-500",
      items: [
        { name: "AI Generation", icon: "🤖", description: "AI-powered content creation" },
        { name: "i18n Support", icon: "🌍", description: "Multi-language support" },
        { name: "PWA Ready", icon: "📱", description: "Progressive web app features" },
        { name: "Dark Mode", icon: "🌙", description: "Beautiful dark theme support" }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % techCategories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentCategory = techCategories[activeCategory];

  return (
    <div className={`relative ${className}`}>
      {/* Tech Stack Visualization */}
      <motion.div
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-2xl">{currentCategory.icon}</span>
            </motion.div>
            <div>
              <h3 className="text-white font-semibold">Technology Stack</h3>
              <p className="text-slate-300 text-sm">Modern development tools</p>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-xs">Production Ready</span>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="bg-slate-700 px-4 py-2 flex gap-2 overflow-x-auto">
          {techCategories.map((category, index) => (
            <motion.button
              key={index}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === index
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              onClick={() => setActiveCategory(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.category}
            </motion.button>
          ))}
        </div>

        {/* Tech Items Grid */}
        <div className="p-4">
          <motion.div
            key={activeCategory}
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {currentCategory.items.map((item, index) => (
              <motion.div
                key={index}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  hoveredItem === index
                    ? 'border-white/30 bg-white/10'
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white font-medium text-sm">{item.name}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
                
                {/* Progress Bar */}
                <motion.div
                  className="mt-2 bg-slate-700 rounded-full h-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${currentCategory.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${85 + index * 5}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tech Stack Flow Visualization */}
        <div className="bg-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-3 h-3 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-blue-400 text-sm">Frontend</span>
            </div>
            
            <motion.div
              className="flex-1 mx-4 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400"
              animate={{ 
                background: [
                  "linear-gradient(to right, #3b82f6, #8b5cf6, #10b981)",
                  "linear-gradient(to right, #10b981, #3b82f6, #8b5cf6)",
                  "linear-gradient(to right, #3b82f6, #8b5cf6, #10b981)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="flex items-center gap-2">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
              <span className="text-green-400 text-sm">Backend</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-slate-400/30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 30}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.6
            }}
          >
            <i className={`ri-${['code-s-slash-line', 'database-line', 'server-line', 'cloud-line', 'shield-line', 'flashlight-line', 'cpu-line', 'wifi-line'][i]} text-lg`}></i>
          </motion.div>
        ))}
      </div>

      {/* Connection Network */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {[...Array(6)].map((_, i) => (
            <motion.circle
              key={i}
              cx={`${20 + (i % 3) * 30}%`}
              cy={`${30 + Math.floor(i / 3) * 40}%`}
              r="4"
              fill="rgba(59, 130, 246, 0.3)"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <motion.line
              key={`line-${i}`}
              x1={`${20 + (i % 2) * 30}%`}
              y1={`${30 + Math.floor(i / 2) * 40}%`}
              x2={`${20 + ((i + 1) % 2) * 30}%`}
              y2={`${30 + Math.floor((i + 1) / 2) * 40}%`}
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                repeatDelay: 3
              }}
            />
          ))}
        </svg>
      </div>

      {/* Interactive Hover Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
        whileHover={{ 
          background: "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
        }}
      />
    </div>
  );
}
