import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface RealTimeCollaborationAnimationProps {
  className?: string;
}

export default function RealTimeCollaborationAnimation({ className = "" }: RealTimeCollaborationAnimationProps) {
  const [activeUsers, setActiveUsers] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const users = [
    { name: "Sarah", color: "bg-blue-500", avatar: "S" },
    { name: "Mike", color: "bg-green-500", avatar: "M" },
    { name: "Emma", color: "bg-purple-500", avatar: "E" },
    { name: "Alex", color: "bg-orange-500", avatar: "A" }
  ];

  const sampleMessages = [
    "Great work on the implementation!",
    "Can you review the authentication logic?",
    "The API endpoint is working perfectly",
    "Let's schedule a code review session",
    "I've updated the documentation",
    "The tests are passing now"
  ];

  useEffect(() => {
    const userInterval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 4) + 1);
    }, 3000);

    const messageInterval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        const newMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        setMessages(prev => [...prev.slice(-4), newMessage]);
        setIsTyping(false);
      }, 1500);
    }, 4000);

    return () => {
      clearInterval(userInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Collaboration Interface */}
      <motion.div
        className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-green-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <i className="ri-flashlight-line text-2xl text-green-300"></i>
            </motion.div>
            <div>
              <h3 className="text-white font-semibold">Live Collaboration</h3>
              <p className="text-green-200 text-sm">Real-time learning session</p>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-xs">{activeUsers} online</span>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 h-64 flex">
          {/* Code Editor Area */}
          <div className="flex-1 bg-slate-800 rounded-lg p-3 mr-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">shared-editor.js</span>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-green-400 text-xs">Live editing</span>
              </div>
            </div>
            
            <div className="font-mono text-sm text-slate-300 space-y-1">
              <div className="text-slate-500">1  <span className="text-blue-400">const</span> <span className="text-yellow-400">express</span> = <span className="text-blue-400">require</span>(<span className="text-green-400">'express'</span>);</div>
              <div className="text-slate-500">2  <span className="text-blue-400">const</span> <span className="text-yellow-400">app</span> = <span className="text-blue-400">express</span>();</div>
              <motion.div
                className="text-slate-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                3  <span className="text-blue-400">app</span>.<span className="text-yellow-400">get</span>(<span className="text-green-400">'/'</span>, (<span className="text-purple-400">req</span>, <span className="text-purple-400">res</span>) =&gt; &#123;&#123;
              </motion.div>
              <div className="text-slate-500 ml-4">4    <span className="text-blue-400">res</span>.<span className="text-yellow-400">send</span>(<span className="text-green-400">'Hello World!'</span>);</div>
              <div className="text-slate-500">5  &#125;&#125;);</div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="w-64 bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm font-medium">Chat</span>
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>

            {/* Active Users */}
            <div className="mb-3">
              <div className="flex -space-x-2">
                {users.slice(0, activeUsers).map((user, index) => (
                  <motion.div
                    key={user.name}
                    className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-slate-800`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {user.avatar}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-700 rounded-lg p-2 text-xs text-slate-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-green-400 font-medium">Sarah</span>
                    <span className="text-slate-500 text-xs">2m ago</span>
                  </div>
                  {message}
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className="bg-slate-700 rounded-lg p-2 text-xs text-slate-300"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-blue-400 font-medium">Mike</span>
                    <span className="text-slate-500 text-xs">typing...</span>
                  </div>
                  <div className="flex gap-1">
                    <motion.div
                      className="w-1 h-1 bg-slate-400 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-1 h-1 bg-slate-400 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-1 h-1 bg-slate-400 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-slate-700 text-white text-xs rounded px-2 py-1 border border-slate-600 focus:border-green-400 focus:outline-none"
              />
              <motion.button
                className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="ri-send-plane-line text-xs"></i>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="bg-green-800 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-1 text-green-300"
              whileHover={{ scale: 1.05 }}
            >
              <i className="ri-share-line"></i>
              <span>Share Screen</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1 text-blue-300"
              whileHover={{ scale: 1.05 }}
            >
              <i className="ri-video-line"></i>
              <span>Video Call</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1 text-purple-300"
              whileHover={{ scale: 1.05 }}
            >
              <i className="ri-file-copy-line"></i>
              <span>Share Files</span>
            </motion.div>
          </div>
          
          <motion.div
            className="flex items-center gap-2 text-green-400"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <i className="ri-wifi-line"></i>
            <span>Real-time sync</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Collaboration Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400/30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 4) * 20}%`
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 2.5 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4
            }}
          >
            <i className={`ri-${['user-line', 'group-line', 'chat-line', 'message-line', 'notification-line', 'bell-line', 'flashlight-line', 'wifi-line'][i]} text-lg`}></i>
          </motion.div>
        ))}
      </div>

      {/* Connection Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {[...Array(6)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${15 + i * 15} ${25} Q ${30} ${40} ${45 + i * 10} ${55}`}
              stroke="rgba(34, 197, 94, 0.3)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.5 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.3,
                repeatDelay: 2
              }}
            />
          ))}
        </svg>
      </div>

      {/* Interactive Hover Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
        whileHover={{ 
          background: "linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))"
        }}
      />
    </div>
  );
}
