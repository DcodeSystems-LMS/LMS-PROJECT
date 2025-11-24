import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/base/Button';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Demo video URL from Supabase storage
  const demoVideoUrl = 'https://supabase.dcodesys.in/storage/v1/object/public/demo-videos/DCodesystems_LMS_Demo_Video_Generation.mp4';

  useEffect(() => {
    if (isOpen && videoRef.current) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen]);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <i className="ri-play-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl text-white font-semibold">DCodesystems LMS Demo</h2>
                  <p className="text-white/60 text-sm">Watch our platform in action</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/10 p-2"
              >
                <i className="ri-close-line text-xl"></i>
              </Button>
            </div>

            {/* Video Container */}
            <div className="relative bg-black">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading demo video...</p>
                  </div>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="text-center p-8">
                    <i className="ri-error-warning-line text-4xl text-red-400 mb-4"></i>
                    <h3 className="text-xl text-white mb-2">Video Loading Error</h3>
                    <p className="text-white/70 mb-4">
                      Unable to load the demo video. Please check your internet connection and try again.
                    </p>
                    <Button
                      onClick={() => {
                        setHasError(false);
                        setIsLoading(true);
                        if (videoRef.current) {
                          videoRef.current.load();
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <i className="ri-refresh-line mr-2"></i>
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full h-auto max-h-[70vh] object-contain"
                controls
                preload="metadata"
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMTE0MTU0Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNDAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTM4MCAyMDUgTDM4MCAyNDUgTDM4MCAyMDUgWiIgZmlsbD0iI0ZGRiIvPgo8L3N2Zz4K"
              >
                <source src={demoVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg text-white font-semibold mb-1">Experience the Full Platform</h3>
                  <p className="text-white/60 text-sm">
                    See interactive coding, AI assessments, video learning, and real-time collaboration
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <i className="ri-rocket-line mr-2"></i>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

