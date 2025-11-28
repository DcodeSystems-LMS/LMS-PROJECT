import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssessmentCelebrationProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  onComplete: () => void;
}

const AssessmentCelebration: React.FC<AssessmentCelebrationProps> = ({
  isOpen,
  score,
  totalQuestions,
  onComplete
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset all animation states
      setShowConfetti(false);
      setShowBalloons(false);
      setShowSparkles(false);
      setShowFireworks(false);
      
      // Stagger the animations with slight delays
      setTimeout(() => setShowConfetti(true), 100);
      setTimeout(() => setShowBalloons(true), 400);
      setTimeout(() => setShowSparkles(true), 700);
      setTimeout(() => setShowFireworks(true), 1000);
    }
  }, [isOpen]);

  const handleClick = () => {
    onComplete();
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Outstanding! 🎉";
    if (score >= 80) return "Excellent Work! 🌟";
    if (score >= 70) return "Great Job! 👏";
    if (score >= 60) return "Good Work! 👍";
    return "Keep Learning! 📚";
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-yellow-500";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 60) return "text-orange-500";
    return "text-gray-500";
  };

  // Confetti pieces
  const confettiPieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    rotation: Math.random() * 360,
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd3a5', '#ff7675', '#74b9ff'][Math.floor(Math.random() * 10)]
  }));

  // Balloons
  const balloons = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 100,
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd3a5', '#ff7675', '#74b9ff', '#fd79a8', '#fdcb6e'][i % 12],
    delay: i * 0.15
  }));

  // Sparkles
  const sparkles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 3
  }));

  // Fireworks
  const fireworks = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10, // Keep fireworks in center area
    y: Math.random() * 40 + 20, // Keep fireworks in upper area
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#a8e6cf'][i % 6],
    delay: i * 0.8,
    particles: Array.from({ length: 12 }, (_, j) => ({
      id: j,
      angle: (j * 30) + Math.random() * 15,
      distance: Math.random() * 60 + 20
    }))
  }));

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
      onClick={handleClick}
    >
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: piece.color,
                  left: `${piece.x}%`,
                  top: `${piece.y}%`,
                }}
                initial={{ 
                  y: -10, 
                  rotate: 0,
                  scale: 0 
                }}
                animate={{ 
                  y: window.innerHeight + 10, 
                  rotate: piece.rotation + 360,
                  scale: [0, 1, 0.8, 1, 0]
                }}
                transition={{ 
                  duration: 4,
                  delay: Math.random() * 0.8,
                  ease: "easeOut"
                }}
                exit={{ opacity: 0 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Balloons Animation */}
      <AnimatePresence>
        {showBalloons && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {balloons.map((balloon) => (
              <motion.div
                key={balloon.id}
                className="absolute"
                style={{
                  left: `${balloon.x}%`,
                  top: `${balloon.y}%`,
                }}
                initial={{ 
                  y: window.innerHeight + 50,
                  scale: 0,
                  rotate: -15 + Math.random() * 30
                }}
                animate={{ 
                  y: -100,
                  scale: [0, 1.2, 1],
                  rotate: -15 + Math.random() * 30
                }}
                transition={{ 
                  duration: 5,
                  delay: balloon.delay,
                  ease: "easeOut"
                }}
                exit={{ opacity: 0 }}
              >
                <div 
                  className="w-8 h-10 rounded-full relative"
                  style={{ backgroundColor: balloon.color }}
                >
                  <div 
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent"
                    style={{ borderTopColor: balloon.color }}
                  />
                  <div 
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0.5 h-4"
                    style={{ backgroundColor: '#8B4513' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Sparkles Animation */}
      <AnimatePresence>
        {showSparkles && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                className="absolute"
                style={{
                  left: `${sparkle.x}%`,
                  top: `${sparkle.y}%`,
                  width: sparkle.size,
                  height: sparkle.size,
                }}
                initial={{ 
                  scale: 0,
                  rotate: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  rotate: 360,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  delay: sparkle.delay,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                exit={{ opacity: 0 }}
              >
                <div className="w-full h-full bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Fireworks Animation */}
      <AnimatePresence>
        {showFireworks && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {fireworks.map((firework) => (
              <motion.div
                key={firework.id}
                className="absolute"
                style={{
                  left: `${firework.x}%`,
                  top: `${firework.y}%`,
                }}
                initial={{ 
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1, 0.8, 1, 0],
                  opacity: [0, 1, 0.8, 1, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  delay: firework.delay,
                  ease: "easeOut"
                }}
                exit={{ opacity: 0 }}
              >
                {/* Firework particles */}
                {firework.particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: firework.color,
                      left: '50%',
                      top: '50%',
                      transformOrigin: '0 0'
                    }}
                    initial={{ 
                      x: 0,
                      y: 0,
                      scale: 0
                    }}
                    animate={{ 
                      x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                      y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
                      scale: [0, 1, 0.8, 0]
                    }}
                    transition={{ 
                      duration: 1.5,
                      delay: firework.delay + 0.3,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Celebration Content */}
      <motion.div
        className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4 relative overflow-hidden cursor-pointer"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          y: [0, -5, 0]
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.8,
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        exit={{ scale: 0, rotate: 180 }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse" />
          <div className="absolute top-8 right-6 w-6 h-6 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-6 left-6 w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Celebration Icon */}
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 0.6,
            delay: 0.5,
            repeat: 2
          }}
        >
          🎉
        </motion.div>

        {/* Success Message */}
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Assessment Complete!
        </motion.h2>

        {/* Score Display */}
        <motion.div
          className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 1,
            type: "spring",
            stiffness: 200
          }}
        >
          {score}%
        </motion.div>

        {/* Score Message */}
        <motion.p
          className="text-lg text-gray-600 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {getScoreMessage(score)}
        </motion.p>

        {/* Progress Bar */}
        <motion.div
          className="w-full bg-gray-200 rounded-full h-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.div
            className={`h-3 rounded-full ${
              score >= 90 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
              score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
              score >= 70 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
              score >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
              'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, delay: 1.6, ease: "easeOut" }}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex justify-between text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <span>Score: {score}%</span>
          <span>Questions: {totalQuestions}</span>
        </motion.div>

        {/* Click to continue indicator */}
        <motion.div
          className="mt-4 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="ml-2">Click anywhere to continue...</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AssessmentCelebration;
