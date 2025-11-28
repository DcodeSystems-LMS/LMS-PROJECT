import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface VideoLearningAnimationProps {
  className?: string;
}

export default function VideoLearningAnimation({ className = "" }: VideoLearningAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(100);
  const [quality, setQuality] = useState("1080p");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const qualities = ["480p", "720p", "1080p", "4K"];
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  const progress = (currentTime / duration) * 100;

  return (
    <div className={`relative ${className}`}>
      {/* Video Player Interface */}
      <motion.div
        className="bg-slate-900 rounded-lg overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Video Container */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 h-64 flex items-center justify-center">
          {/* Video Thumbnail/Preview */}
          <motion.div
            className="relative w-full h-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center"
            animate={{
              background: [
                "linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(239, 68, 68, 0.2))",
                "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                "linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(239, 68, 68, 0.2))"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {/* Play Button */}
            <motion.button
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
              onClick={() => setIsPlaying(!isPlaying)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: isPlaying ? 0.8 : 1 }}
            >
              <motion.i
                className={`text-2xl ${isPlaying ? 'ri-pause-line' : 'ri-play-line'}`}
                animate={{ x: isPlaying ? 0 : 2 }}
              />
            </motion.button>

            {/* Video Title Overlay */}
            <motion.div
              className="absolute top-4 left-4 right-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-white font-semibold text-lg">Advanced React Patterns</h3>
              <p className="text-white/70 text-sm">Learn modern React development techniques</p>
            </motion.div>

            {/* Quality Indicator */}
            <motion.div
              className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded px-2 py-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="text-white text-xs font-medium">{quality}</span>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              className="absolute bottom-4 left-4 right-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="bg-white/20 rounded-full h-1">
                <motion.div
                  className="bg-orange-500 h-full rounded-full"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="flex justify-between text-white text-xs mt-1">
                <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Loading Spinner (when not playing) */}
          {!isPlaying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            {/* Play/Pause and Speed */}
            <div className="flex items-center gap-3">
              <motion.button
                className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors"
                onClick={() => setIsPlaying(!isPlaying)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className={`text-sm ${isPlaying ? 'ri-pause-line' : 'ri-play-line'}`} />
              </motion.button>
              
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">Speed:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-slate-700 text-white text-sm rounded px-2 py-1"
                >
                  {speeds.map(speed => (
                    <option key={speed} value={speed}>{speed}x</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quality Selector */}
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">Quality:</span>
              <div className="flex gap-1">
                {qualities.map((q) => (
                  <motion.button
                    key={q}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      quality === q 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    onClick={() => setQuality(q)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Features Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-green-400">
                <i className="ri-subtitles-line"></i>
                <span>Subtitles</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <i className="ri-download-line"></i>
                <span>Download</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <i className="ri-bookmark-line"></i>
                <span>Bookmark</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div
                className="flex items-center gap-1 text-orange-400"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <i className="ri-wifi-line"></i>
                <span>HD Streaming</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Video Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-orange-400/30"
            style={{
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 30}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8
            }}
          >
            <i className={`ri-${['video-line', 'play-circle-line', 'volume-up-line', 'settings-line', 'fullscreen-line', 'share-line'][i]} text-lg`}></i>
          </motion.div>
        ))}
      </div>

      {/* Streaming Waves */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {[...Array(4)].map((_, i) => (
            <motion.path
              key={i}
              d={`M 0 ${50 + i * 20} Q ${25} ${40 + i * 20} ${50} ${50 + i * 20} T ${100} ${50 + i * 20}`}
              stroke="rgba(251, 146, 60, 0.3)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                repeatDelay: 3
              }}
            />
          ))}
        </svg>
      </div>

      {/* Interactive Hover Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
        whileHover={{ 
          background: "linear-gradient(45deg, rgba(251, 146, 60, 0.1), rgba(239, 68, 68, 0.1))"
        }}
      />
    </div>
  );
}
