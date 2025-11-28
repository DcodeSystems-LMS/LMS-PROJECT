import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface CodePlaygroundAnimationProps {
  className?: string;
}

export default function CodePlaygroundAnimation({ className = "" }: CodePlaygroundAnimationProps) {
  const [currentCode, setCurrentCode] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const codeExamples = [
    {
      language: "Python",
      code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10 numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
      output: "F(0) = 0\nF(1) = 1\nF(2) = 1\nF(3) = 2\nF(4) = 3\nF(5) = 5\nF(6) = 8\nF(7) = 13\nF(8) = 21\nF(9) = 34"
    },
    {
      language: "JavaScript",
      code: `// Async function with error handling
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

// Usage
fetchUserData(123).then(user => {
    console.log('User:', user.name);
});`,
      output: "User: John Doe"
    },
    {
      language: "React",
      code: `import React, { useState, useEffect } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        document.title = \`Count: \${count}\`;
    }, [count]);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}`,
      output: "Count: 0\n[Increment Button]"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentCode((prev) => (prev + 1) % codeExamples.length);
        setIsTyping(false);
      }, 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentExample = codeExamples[currentCode];

  return (
    <div className={`relative ${className}`}>
      {/* Code Editor Interface */}
      <motion.div
        className="bg-slate-900 rounded-lg overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Editor Header */}
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-slate-300 text-sm ml-4">Code Playground</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="px-2 py-1 bg-blue-600 rounded text-xs text-white"
              key={currentCode}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentExample.language}
            </motion.div>
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 font-mono text-sm">
          <motion.div
            key={currentCode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="space-y-1"
          >
            {currentExample.code.split('\n').map((line, index) => (
              <motion.div
                key={index}
                className="text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-slate-500 mr-4">{String(index + 1).padStart(2, ' ')}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {line}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Output Panel */}
        <motion.div
          className="bg-slate-800 border-t border-slate-700 p-4"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-terminal-line text-green-400"></i>
            <span className="text-green-400 text-sm font-medium">Output</span>
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <motion.div
            className="text-slate-300 font-mono text-sm whitespace-pre-line"
            key={`output-${currentCode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            {currentExample.output}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating Code Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-xs text-blue-400/30 font-mono"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8
            }}
          >
            {['const', 'function', 'async', 'await', 'return', 'class'][i]}
          </motion.div>
        ))}
      </div>

      {/* Connection Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {[...Array(4)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${20 + i * 20} ${30} Q ${50} ${50} ${80 - i * 10} ${70}`}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ 
                duration: 2 + i * 0.3, 
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
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
        whileHover={{ 
          background: "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
        }}
      />
    </div>
  );
}
