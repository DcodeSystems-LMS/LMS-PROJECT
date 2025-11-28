import { motion } from "framer-motion";

interface DataAnalyticsAnimatedHumanProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function DataAnalyticsAnimatedHuman({ className = "", size = "md" }: DataAnalyticsAnimatedHumanProps) {
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

      {/* Teaching Pointer/Stick */}
      <motion.div
        className="absolute -right-8 top-1/3 w-1 h-8 bg-gray-600 rounded-full"
        animate={{
          rotate: [0, 10, -10, 0],
          y: [0, -2, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          className="absolute top-0 w-2 h-2 bg-red-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Data Charts around the human */}
      {/* Bar Chart */}
      <motion.div
        className="absolute -left-8 top-1/4 w-6 h-4 bg-white/10 rounded p-1"
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex items-end space-x-0.5 h-full">
          {[2, 4, 3, 5].map((height, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-blue-500 to-cyan-400 rounded-sm"
              style={{ height: `${height * 2}px`, width: '2px' }}
              animate={{
                scaleY: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Line Chart */}
      <motion.div
        className="absolute -right-10 top-1/2 w-8 h-4 bg-white/10 rounded p-1"
        animate={{
          y: [0, -4, 0],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg className="w-full h-full">
          <motion.path
            d="M0,3 L2,1 L4,2 L6,0 L8,1"
            stroke="rgba(34, 197, 94, 0.8)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </svg>
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        className="absolute -left-10 top-2/3 w-5 h-5 bg-white/10 rounded-full"
        animate={{
          y: [0, -2, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full rounded-full relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </motion.div>

      {/* Data Points floating around */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          style={{
            left: `${20 + i * 12}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 5, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Data Flow Arrows */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {/* Arrows showing data flow */}
        <motion.div
          className="absolute -left-6 top-1/3 w-4 h-1 bg-gradient-to-r from-blue-400 to-transparent"
          animate={{
            x: [0, 20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -right-6 top-1/2 w-4 h-1 bg-gradient-to-l from-green-400 to-transparent"
          animate={{
            x: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Teaching Speech Bubble */}
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
          📊 Data Insights
        </motion.div>
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/20 rotate-45"
        />
      </motion.div>

      {/* Analytics Dashboard Elements */}
      <motion.div
        className="absolute -left-12 top-1/4 w-8 h-6 bg-white/5 rounded border border-white/10"
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
          <div className="text-xs text-white/60 mb-1">Analytics</div>
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-2 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-sm"
                animate={{
                  scaleY: [1, 1.3, 1],
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
