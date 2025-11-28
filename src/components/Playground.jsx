import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { supabase } from '../lib/supabase';
import { useJudge0Runner } from '../hooks/useJudge0Runner';
import { 
  getAllLanguageNames, 
  getLanguageByName, 
  getLanguageId, 
  getDefaultCode 
} from '../utils/languageMap';

const Playground = () => {
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [consoleLines, setConsoleLines] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const consoleRef = useRef(null);
  
  // Use Judge0 runner hook
  const { run, isRunning, result, error, statusLabel, reset: resetRunner } = useJudge0Runner();

  // Initialize component
  useEffect(() => {
    initializePlayground();
  }, []);

  // Update code when language changes
  useEffect(() => {
    if (selectedLanguage) {
      setCode(getDefaultCode(selectedLanguage));
      clearConsole();
    }
  }, [selectedLanguage]);

  // Check auth status
  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-scroll console when output changes

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLines]);

  const initializePlayground = () => {
    setCode(getDefaultCode(selectedLanguage));
    setConsoleLines([]);
    setIsLoading(false);
  };

  const addConsoleLine = (type, content) => {
    setConsoleLines(prev => [...prev, { type, content, timestamp: Date.now() }]);
  };

  const clearConsole = () => {
    resetRunner();
    setConsoleLines([]);
  };

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadUserSubmissions();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const loadUserSubmissions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const saveSubmission = async (code, language, output, success) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          language: language,
          code: code,
          output: output,
          success: success,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Reload submissions
      loadUserSubmissions();
    } catch (error) {
      console.error('Error saving submission:', error);
    }
  };

  // Handle result updates from Judge0
  useEffect(() => {
    if (result) {
      setConsoleLines([]);
      
      // Show compilation error if present
      if (result.compile_output) {
        const compileLines = result.compile_output.trim().split('\n');
        compileLines.forEach(line => {
          if (line.trim()) {
            addConsoleLine('error', line.trim());
          }
        });
      }
      
      // Show stderr if present
      if (result.stderr) {
        const errorLines = result.stderr.trim().split('\n');
        errorLines.forEach(line => {
          if (line.trim()) {
            addConsoleLine('error', line.trim());
          }
        });
      }
      
      // Show stdout if present
      if (result.stdout) {
        const outputLines = result.stdout.trim().split('\n');
        outputLines.forEach(line => {
          if (line.trim()) {
            addConsoleLine('output', line.trim());
          }
        });
      }
      
      // Show message if present (often contains error details)
      if (result.message) {
        const messageLines = result.message.trim().split('\n');
        messageLines.forEach(line => {
          if (line.trim()) {
            addConsoleLine('error', line.trim());
          }
        });
      }
      
      // Show status
      if (statusLabel) {
        if (statusLabel === 'Accepted') {
          addConsoleLine('system', '=== Code Execution Successful ===');
        } else {
          addConsoleLine('error', `Status: ${statusLabel}`);
        }
      }
      
      // Show execution time and memory
      if (result.time !== null && result.time !== undefined) {
        const memoryStr = result.memory ? `${result.memory} KB` : 'N/A';
        addConsoleLine('system', `⏱️  Time: ${result.time}s | Memory: ${memoryStr}`);
      }
      
      // Save submission if user is authenticated
      if (user && statusLabel === 'Accepted') {
        const output = result.stdout || result.stderr || result.compile_output || '';
        saveSubmission(code, selectedLanguage, output, statusLabel === 'Accepted');
      }
    }
  }, [result, statusLabel, user, code, selectedLanguage]);

  // Handle errors from Judge0
  useEffect(() => {
    if (error) {
      setConsoleLines(prev => [
        ...prev.filter(line => !line.content.includes('Compiling')),
        { type: 'error', content: `❌ ${error}`, timestamp: Date.now() }
      ]);
    }
  }, [error]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      addConsoleLine('error', 'Please enter some code to run.');
      return;
    }

    // Get language ID
    const languageId = getLanguageId(selectedLanguage);
    if (!languageId) {
      addConsoleLine('error', `Language "${selectedLanguage}" is not supported.`);
      return;
    }

    // Clear console and show compiling message
    setConsoleLines([]);
    addConsoleLine('system', '⚡ Compiling and running...');
    
    // Reset runner state
    resetRunner();
    
    // Run code with Judge0
    try {
      await run(languageId, code, stdin);
    } catch (err) {
      console.error('Execution error:', err);
      setConsoleLines(prev => [
        ...prev.filter(line => !line.content.includes('Compiling')),
        { type: 'error', content: `❌ Error: ${err.message}`, timestamp: Date.now() }
      ]);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    // Reset runner state for new language
    resetRunner();
    
    setSelectedLanguage(newLanguage);
    setCode(getDefaultCode(newLanguage));
    clearConsole();
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });

    // Set up keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
  };

  const loadSubmission = (submission) => {
    setCode(submission.code);
    setSelectedLanguage(submission.language);
    clearConsole();
    addConsoleLine('system', 'Loaded previous submission.');
    if (submission.output) {
      addConsoleLine('output', submission.output);
    }
  };

  const downloadCode = () => {
    const language = getLanguageByName(selectedLanguage);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearCode = () => {
    executionService.reset();
    setCode(getDefaultCode(selectedLanguage));
    clearConsole();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render auth required message
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please sign in to use the Code Playground.
            </p>
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Interactive Code Playground
              </h1>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getAllLanguageNames().map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Toggle theme"
                >
                  {isDarkMode ? '🌞' : '🌙'}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                History
              </button>
              <button
                onClick={downloadCode}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Download
              </button>
              <button
                onClick={clearCode}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors flex items-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    <span>Run Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Editor */}
              <div className="h-96">
                <Editor
                  height="100%"
                  language={selectedLanguage.toLowerCase()}
                  value={code}
                  onChange={setCode}
                  onMount={handleEditorDidMount}
                  theme={isDarkMode ? 'vs-dark' : 'light'}
                  options={{
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    automaticLayout: true,
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                    tabSize: 2,
                    insertSpaces: true,
                  }}
                />
              </div>

              {/* Stdin Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Standard Input (stdin)
                    </h3>
                  </div>
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Enter input for your program (one value per line)..."
                    className="w-full h-24 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    disabled={isRunning}
                  />
                </div>
              </div>

              {/* Terminal Output (Read-Only) */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Terminal (Output Only)
                    </h3>
                    <button
                      onClick={clearConsole}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Clear Console
                    </button>
                  </div>
                  
                  {/* Read-Only Console Output */}
                  <div 
                    ref={consoleRef}
                    className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm min-h-32 max-h-96 overflow-y-auto"
                    style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                  >
                    {consoleLines.length === 0 && (
                      <div className="text-gray-500 text-center py-8">
                        No output yet. Write your code and click "Run Code" to execute.
                      </div>
                    )}
                    {consoleLines.map((line, index) => (
                      <div
                        key={index}
                        className={`mb-1 ${
                          line.type === 'error'
                            ? 'text-red-400'
                            : line.type === 'system'
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}
                      >
                        {line.content}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {showHistory && submissions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Submissions
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {submissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => loadSubmission(submission)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.language}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {submission.code.substring(0, 50)}...
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          submission.success 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {submission.success ? 'Success' : 'Error'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
