import { motion } from "framer-motion";

interface IoTAnimatedHumanProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function IoTAnimatedHuman({ className = "", size = "md" }: IoTAnimatedHumanProps) {
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

      {/* IoT Devices around the human */}
      {/* Smartphone */}
      <motion.div
        className="absolute -right-6 top-1/2 w-4 h-6 bg-gray-800 rounded-lg"
        animate={{
          y: [0, -5, 0],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-2 bg-blue-500 rounded-t-lg"></div>
        <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1"></div>
      </motion.div>

      {/* Smart Watch */}
      <motion.div
        className="absolute -left-6 top-1/3 w-3 h-4 bg-gray-700 rounded-full"
        animate={{
          y: [0, -3, 0],
          rotate: [0, -2, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-1 bg-green-400 rounded-full mt-1"></div>
      </motion.div>

      {/* Smart Home Device */}
      <motion.div
        className="absolute -right-8 top-1/4 w-5 h-3 bg-gray-600 rounded"
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-1 bg-yellow-400 rounded-t"></div>
        <div className="w-1 h-1 bg-red-400 rounded-full mx-auto mt-0.5"></div>
      </motion.div>

      {/* IoT Sensor */}
      <motion.div
        className="absolute -left-8 top-2/3 w-3 h-3 bg-gray-500 rounded-full"
        animate={{
          y: [0, -2, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 2.3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-1 bg-blue-300 rounded-full"></div>
      </motion.div>

      {/* Data Flow Lines */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {/* Connection lines from human to devices */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.line
            x1="50%"
            y1="40%"
            x2="75%"
            y2="50%"
            stroke="rgba(34, 197, 94, 0.6)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          />
          <motion.line
            x1="50%"
            y1="35%"
            x2="25%"
            y2="40%"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.8 }}
          />
          <motion.line
            x1="50%"
            y1="45%"
            x2="80%"
            y2="30%"
            stroke="rgba(251, 191, 36, 0.6)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 2.1 }}
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
            transition={{ duration: 2, delay: 2.4 }}
          />
        </svg>
      </motion.div>

      {/* Data packets floating around */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
          style={{
            left: `${30 + i * 15}%`,
            top: `${20 + (i % 2) * 30}%`,
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 5, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Network signal waves */}
      <motion.div
        className="absolute -right-4 top-1/2 transform -translate-y-1/2"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-green-400 rounded-full"
              style={{ height: `${6 + i * 3}px` }}
              animate={{
                scaleY: [1, 1.8, 1],
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
    </motion.div>
  );
}
