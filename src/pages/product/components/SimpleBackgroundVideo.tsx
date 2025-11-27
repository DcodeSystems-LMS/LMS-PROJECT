import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/base/Button';

interface SimpleBackgroundVideoProps {
  onWatchDemo: () => void;
}

export default function SimpleBackgroundVideo({ onWatchDemo }: SimpleBackgroundVideoProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Demo video URL from Supabase storage
  const demoVideoUrl = 'https://supabase.dcodesys.in/storage/v1/object/public/demo-videos/DCodesystems_LMS_Demo_Video_Generation.mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => {
        setIsVideoLoaded(true);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={demoVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Video Loading Overlay */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70 text-lg">Loading demo video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24 sm:pb-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 sm:px-6 sm:py-3">
              <i className="ri-sparkling-line text-yellow-400 text-lg sm:text-xl"></i>
              <span className="text-white text-sm sm:text-base font-medium">
                {isVideoLoaded ? 'Live Demo Running' : 'Production-Ready Full-Stack LMS Platform'}
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-4 sm:mb-6 drop-shadow-2xl">
              DCodesystems
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6 sm:mb-8 drop-shadow-xl">
              LMS Platform
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-lg"
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
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-6 py-4 sm:px-10 sm:py-7 text-base sm:text-lg shadow-2xl shadow-purple-500/50 rounded-xl w-full sm:w-auto backdrop-blur-sm"
              onClick={onWatchDemo}
            >
              <i className="ri-play-line mr-2"></i>
              Watch Demo
              <i className="ri-arrow-right-line ml-2 group-hover:translate-x-1 transition-transform"></i>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-xl bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 px-6 py-4 sm:px-10 sm:py-7 text-base sm:text-lg rounded-xl w-full sm:w-auto"
            >
              Explore Features
            </Button>
          </motion.div>

          {/* Video Status Indicator */}
          {isVideoLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-white/70 text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>Demo video playing in background</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}













