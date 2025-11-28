import { motion } from "framer-motion";

interface AnimatedHumanProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function AnimatedHuman({ className = "", size = "md" }: AnimatedHumanProps) {
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

      {/* Floating particles around human */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Sound waves */}
      <motion.div
        className="absolute -right-4 top-1/2 transform -translate-y-1/2"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex space-x-1">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-purple-400 rounded-full"
              style={{ height: `${8 + i * 2}px` }}
              animate={{
                scaleY: [1, 1.5, 1],
              }}
              transition={{
                duration: 1 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
