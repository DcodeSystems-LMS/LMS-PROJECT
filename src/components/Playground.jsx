import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { supabase } from '../lib/supabase';
import executionService from '../services/executionService';
import ConsoleTerminal from './ConsoleTerminal';
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
  const [consoleLines, setConsoleLines] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [executionId, setExecutionId] = useState(null);

  const editorRef = useRef(null);
  const consoleRef = useRef(null);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

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

  // Focus input when waiting for input
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWaitingForInput]);

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
    executionService.reset();
    
    // Reset terminal component
    if (terminalRef.current) {
      terminalRef.current.reset();
    }
    
    setConsoleLines([]);
    setIsWaitingForInput(false);
    setExecutionId(null);
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

  const handleRunCode = async (userInput = '') => {
    if (!code.trim()) {
      addConsoleLine('error', 'Please enter some code to run.');
      return;
    }

    setIsRunning(true);
    setIsWaitingForInput(false);
    
    // Clear console and show fresh output for new runs
    if (!userInput) {
      setConsoleLines([]);
      addConsoleLine('system', 'Running code...');
    }

    try {
      const isFirstRun = !userInput;
      const result = await executionService.executeCode(code, selectedLanguage, userInput, isFirstRun);
      
      if (result.success) {
        if (result.output) {
          addConsoleLine('output', result.output);
        }
        
        if (result.needsInput) {
          setIsWaitingForInput(true);
          setExecutionId(result.executionId);
        } else {
          addConsoleLine('system', '=== Code Execution Successful ===');
          setExecutionId(null);
        }
      } else {
        addConsoleLine('error', result.error);
        setExecutionId(null);
      }

      // Save submission if user is authenticated and execution is complete
      if (user && result.isComplete) {
        await saveSubmission(code, selectedLanguage, result.output || result.error, result.success);
      }
    } catch (error) {
      addConsoleLine('error', error.message);
      setExecutionId(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleInputSubmit = (userInput) => {
    if (userInput === '__STOP__') {
      // Handle Ctrl+C to stop execution
      executionService.stopExecution();
      setIsWaitingForInput(false);
      setExecutionId(null);
      addConsoleLine('system', 'Execution stopped by user.');
      return;
    }

    if (!userInput.trim()) return;

    // Append user input to the last prompt line (inline format like second image)
    setConsoleLines(prev => {
      const newLines = [...prev];
      // Find the last output/system line and append input to it
      for (let i = newLines.length - 1; i >= 0; i--) {
        if (newLines[i].type === 'output' || newLines[i].type === 'system') {
          const lastLine = newLines[i].content.trim();
          // Append input inline to the prompt (matching second image format)
          if (lastLine.endsWith(':') || lastLine.endsWith('?') || lastLine.match(/^(Enter|Input|Type|Number|Please)/i)) {
            newLines[i] = {
              ...newLines[i],
              content: newLines[i].content.trim() + ' ' + userInput
            };
          }
          break;
        }
      }
      return newLines;
    });
    
    // Execute code with input
    handleRunCode(userInput);
  };

  const handleLanguageChange = (newLanguage) => {
    // Reset execution service state for new language
    executionService.reset();
    
    // Reset terminal component
    if (terminalRef.current) {
      terminalRef.current.reset();
    }
    
    setSelectedLanguage(newLanguage);
    setCode(getDefaultCode(newLanguage));
    clearConsole();
    setIsWaitingForInput(false);
    setExecutionId(null);
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
    
    // Reset terminal component
    if (terminalRef.current) {
      terminalRef.current.reset();
    }
    
    setCode(getDefaultCode(selectedLanguage));
    clearConsole();
    setIsWaitingForInput(false);
    setExecutionId(null);
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
                onClick={() => handleRunCode()}
                disabled={isRunning || isWaitingForInput}
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

              {/* Interactive Console */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Interactive Terminal
                    </h3>
                    <div className="flex items-center space-x-2">
                      {isWaitingForInput && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          Waiting for input...
                        </span>
                      )}
                      <button
                        onClick={clearConsole}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Clear Console
                      </button>
                    </div>
                  </div>
                  
                  {/* Terminal Component */}
                  <ConsoleTerminal
                    ref={terminalRef}
                    key={selectedLanguage}
                    isWaitingForInput={isWaitingForInput}
                    onInputSubmit={handleInputSubmit}
                    consoleLines={consoleLines}
                    onClearConsole={clearConsole}
                    isRunning={isRunning}
                  />
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
