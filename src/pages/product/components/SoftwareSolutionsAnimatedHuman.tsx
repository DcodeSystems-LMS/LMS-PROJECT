import { motion } from "framer-motion";

interface SoftwareSolutionsAnimatedHumanProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SoftwareSolutionsAnimatedHuman({ className = "", size = "md" }: SoftwareSolutionsAnimatedHumanProps) {
  const sizeClasses = {
    sm: "w-16 h-20",
    md: "w-24 h-32", 
    lg: "w-32 h-40"
  };

  return (
    <motion.div 
      className={`relative ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Human Body */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Head */}
        <motion.div
          className="w-8 h-8 bg-pink-200 rounded-full relative"
          animate={{
            rotate: [0, 1, -1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Eyes */}
          <div className="absolute top-2 left-1.5 w-1 h-1 bg-black rounded-full"></div>
          <div className="absolute top-2 right-1.5 w-1 h-1 bg-black rounded-full"></div>
          
          {/* Smile */}
          <motion.div
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 border-b-2 border-black rounded-full"
            animate={{
              scaleX: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Body */}
        <motion.div
          className="w-6 h-8 bg-orange-300 rounded-t-lg mt-1"
          animate={{
            scaleX: [1, 1.02, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Arms */}
          <motion.div
            className="absolute -left-2 top-2 w-1 h-4 bg-orange-300 rounded-full"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -right-2 top-2 w-1 h-4 bg-orange-300 rounded-full"
            animate={{
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Legs */}
        <motion.div
          className="w-6 h-6 bg-blue-600 rounded-b-lg"
          animate={{
            scaleY: [1, 1.02, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Leg movement */}
          <motion.div
            className="absolute -left-1 bottom-0 w-1 h-3 bg-blue-600 rounded-full"
            animate={{
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -right-1 bottom-0 w-1 h-3 bg-blue-600 rounded-full"
            animate={{
              rotate: [0, -2, 2, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>

      {/* Laptop/Computer Screen */}
      <motion.div
        className="absolute -left-8 top-1/3 w-8 h-5 bg-gray-800 rounded"
        animate={{
          y: [0, -3, 0],
          rotate: [0, 1, 0],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Screen */}
        <div className="w-full h-3 bg-black rounded-t">
          {/* Code lines on screen */}
          <motion.div
            className="p-1 text-xs text-green-400 font-mono"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-green-300">const app = () =&gt;</div>
            <div className="text-blue-300">  return &lt;div&gt;</div>
            <div className="text-yellow-300">    &lt;h1&gt;Hello&lt;/h1&gt;</div>
          </motion.div>
        </div>
        {/* Keyboard */}
        <div className="w-full h-1 bg-gray-600 rounded-b"></div>
      </motion.div>

      {/* Code Editor Window */}
      <motion.div
        className="absolute -right-10 top-1/4 w-10 h-6 bg-gray-900 rounded border border-gray-600"
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Code editor content */}
        <div className="p-1 text-xs text-white font-mono">
          <motion.div
            className="text-blue-400"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeInOut"
            }}
          >
            function deploy() &#123;
          </motion.div>
          <motion.div
            className="text-green-400 ml-2"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut"
            }}
          >
            return &quot;Success!&quot;;
          </motion.div>
          <motion.div
            className="text-purple-400"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.5,
              ease: "easeInOut"
            }}
          >
            &#125;
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile App Development */}
      <motion.div
        className="absolute -left-12 top-2/3 w-4 h-6 bg-gray-700 rounded-lg"
        animate={{
          y: [0, -2, 0],
          rotate: [0, -2, 0],
        }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Mobile screen */}
        <div className="w-full h-4 bg-black rounded-t-lg">
          <div className="p-1 text-xs text-white">
            <div className="w-2 h-1 bg-blue-500 rounded mb-1"></div>
            <div className="w-3 h-1 bg-green-500 rounded"></div>
          </div>
        </div>
        {/* Home button */}
        <div className="w-1 h-1 bg-gray-500 rounded-full mx-auto mt-1"></div>
      </motion.div>

      {/* Floating Code Elements */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded"
          style={{
            left: `${20 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 3, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
        >
          {/* Code symbols */}
          <div className="text-xs text-white font-mono text-center">
            {['&lt;', '&gt;', '&#123;', '&#125;', ';'][i]}
          </div>
        </motion.div>
      ))}

      {/* Terminal/Console */}
      <motion.div
        className="absolute -right-8 top-2/3 w-6 h-4 bg-black rounded border border-green-400"
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="p-1 text-xs text-green-400 font-mono">
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            $ npm start
          </motion.div>
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeInOut"
            }}
          >
            ✓ Running...
          </motion.div>
        </div>
      </motion.div>

      {/* Code Flow Lines */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {/* Connection lines showing code flow */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.line
            x1="50%"
            y1="40%"
            x2="25%"
            y2="50%"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.2 }}
          />
          <motion.line
            x1="50%"
            y1="45%"
            x2="75%"
            y2="40%"
            stroke="rgba(34, 197, 94, 0.6)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          />
          <motion.line
            x1="50%"
            y1="50%"
            x2="20%"
            y2="70%"
            stroke="rgba(168, 85, 247, 0.6)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.8 }}
          />
        </svg>
      </motion.div>

      {/* Coding Speech Bubble */}
      <motion.div
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-lg p-2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="text-white text-xs"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          💻 Coding...
        </motion.div>
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/20 rotate-45"
        />
      </motion.div>

      {/* Git Commit Activity */}
      <motion.div
        className="absolute -left-14 top-1/4 w-6 h-4 bg-white/5 rounded border border-white/10"
        animate={{
          y: [0, -5, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="p-1">
          <div className="text-xs text-white/60 mb-1">Git</div>
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
