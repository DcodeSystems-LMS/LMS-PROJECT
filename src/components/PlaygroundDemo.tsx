import React, { useState } from 'react';
import CodePlayground from './CodePlayground';
import Button from './base/Button';
import { Play } from 'lucide-react';

export default function PlaygroundDemo() {
  const [showPlayground, setShowPlayground] = useState(false);

  if (showPlayground) {
    return (
      <CodePlayground 
        onBack={() => setShowPlayground(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Interactive Code Playground
            </h1>
            <p className="text-white/80 text-lg">
              Write, run, and test code in multiple programming languages with our interactive playground.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">🚀 Multiple Languages</h3>
                <p className="text-white/70 text-sm">
                  Support for Python, C, C++, Java, and JavaScript
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">⚡ Real-time Execution</h3>
                <p className="text-white/70 text-sm">
                  Execute code instantly with Judge0 API integration
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">💻 Interactive Console</h3>
                <p className="text-white/70 text-sm">
                  Handle user input and see program output in real-time
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">🎨 Modern UI</h3>
                <p className="text-white/70 text-sm">
                  Beautiful dark theme with syntax highlighting
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowPlayground(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              Launch Playground
            </Button>
            
            <div className="text-white/60 text-sm">
              <p>✅ Free to use - No API key required!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
