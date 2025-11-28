import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AIAssessmentAnimationProps {
  className?: string;
}

export default function AIAssessmentAnimation({ className = "" }: AIAssessmentAnimationProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      type: "Multiple Choice",
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1,
      explanation: "Binary search eliminates half of the search space in each iteration, resulting in O(log n) time complexity."
    },
    {
      type: "Code Review",
      question: "Identify the issue in this Python function:",
      code: `def divide(a, b):
    return a / b`,
      correct: "No error handling for division by zero",
      explanation: "The function doesn't handle the case when b is 0, which would cause a ZeroDivisionError."
    },
    {
      type: "True/False",
      question: "React hooks can only be used in functional components.",
      correct: true,
      explanation: "React hooks are designed specifically for functional components and cannot be used in class components."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsProcessing(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => (prev + 1) % questions.length);
        setIsProcessing(false);
        setShowResults(true);
        setTimeout(() => setShowResults(false), 2000);
      }, 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentQ = questions[currentQuestion];

  return (
    <div className={`relative ${className}`}>
      {/* AI Assessment Interface */}
      <motion.div
        className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-purple-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <i className="ri-brain-line text-2xl text-purple-300"></i>
            </motion.div>
            <div>
              <h3 className="text-white font-semibold">AI Assessment Engine</h3>
              <p className="text-purple-200 text-sm">Intelligent Question Generation</p>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-xs">AI Active</span>
          </motion.div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Question Type Badge */}
            <motion.div
              className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 10 }}
            >
              {currentQ.type}
            </motion.div>

            {/* Question Text */}
            <motion.h4
              className="text-white text-lg mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentQ.question}
            </motion.h4>

            {/* Code Block (if applicable) */}
            {currentQ.code && (
              <motion.div
                className="bg-slate-800 rounded p-3 mb-4 font-mono text-sm text-slate-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentQ.code}
              </motion.div>
            )}

            {/* Options */}
            {currentQ.options && (
              <div className="space-y-2 mb-4">
                {currentQ.options.map((option, index) => (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      showResults && index === currentQ.correct
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-purple-600 bg-purple-600/20 text-white hover:border-purple-400'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                    {showResults && index === currentQ.correct && (
                      <motion.i
                        className="ri-check-line text-green-400 ml-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* True/False Options */}
            {currentQ.type === "True/False" && (
              <div className="flex gap-4 mb-4">
                {[true, false].map((value, index) => (
                  <motion.button
                    key={index}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      showResults && value === currentQ.correct
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-purple-600 bg-purple-600/20 text-white hover:border-purple-400'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {value ? 'True' : 'False'}
                    {showResults && value === currentQ.correct && (
                      <motion.i
                        className="ri-check-line text-green-400 ml-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Explanation */}
            {showResults && (
              <motion.div
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-lightbulb-line text-green-400"></i>
                  <span className="text-green-400 font-medium">AI Explanation</span>
                </div>
                <p className="text-green-200 text-sm">{currentQ.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.div
                className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-white">AI is generating next question...</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Floating AI Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-purple-400/30"
            style={{
              left: `${15 + i * 20}%`,
              top: `${20 + (i % 2) * 30}%`
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.5
            }}
          >
            <i className={`ri-${['brain-line', 'cpu-line', 'flashlight-line', 'robot-line', 'chart-line'][i]} text-lg`}></i>
          </motion.div>
        ))}
      </div>

      {/* Neural Network Visualization */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {[...Array(8)].map((_, i) => (
            <motion.circle
              key={i}
              cx={`${20 + (i % 4) * 20}%`}
              cy={`${30 + Math.floor(i / 4) * 40}%`}
              r="3"
              fill="rgba(147, 51, 234, 0.3)"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <motion.line
              key={`line-${i}`}
              x1={`${20 + (i % 3) * 20}%`}
              y1={`${30 + Math.floor(i / 3) * 40}%`}
              x2={`${20 + ((i + 1) % 3) * 20}%`}
              y2={`${30 + Math.floor((i + 1) / 3) * 40}%`}
              stroke="rgba(147, 51, 234, 0.2)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                repeatDelay: 2
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
