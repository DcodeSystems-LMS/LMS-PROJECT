import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

const ConsoleTerminal = forwardRef(({ 
  isWaitingForInput, 
  onInputSubmit, 
  consoleLines, 
  onClearConsole,
  isRunning 
}, ref) => {
  const [currentInput, setCurrentInput] = useState('');
  const [inputHistory, setInputHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);
  
  const consoleRef = useRef(null);
  const inputRef = useRef(null);
  const cursorIntervalRef = useRef(null);

  // Expose reset method via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      setCurrentInput('');
      setInputHistory([]);
      setHistoryIndex(-1);
      setShowCursor(true);
      if (inputRef.current) {
        inputRef.current.blur();
      }
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    },
    focus: () => {
      if (inputRef.current && isWaitingForInput) {
        inputRef.current.focus();
      }
    }
  }));

  // Reset terminal state when console is cleared (consoleLines becomes empty)
  useEffect(() => {
    if (consoleLines.length === 0 && !isWaitingForInput) {
      setCurrentInput('');
      setInputHistory([]);
      setHistoryIndex(-1);
      setShowCursor(true);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [consoleLines.length, isWaitingForInput]);

  // Reset input state when no longer waiting for input
  useEffect(() => {
    if (!isWaitingForInput) {
      setCurrentInput('');
      setHistoryIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [isWaitingForInput]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLines]);

  // Focus input when waiting for input
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWaitingForInput]);

  // Blinking cursor effect
  useEffect(() => {
    if (isWaitingForInput) {
      cursorIntervalRef.current = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
    } else {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
      setShowCursor(true);
    }

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, [isWaitingForInput]);

  const handleInputSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Only submit if we're waiting for input
    if (!isWaitingForInput) return;

    // Add to input history (even if empty, for tracking)
    if (currentInput.trim()) {
      setInputHistory(prev => [...prev, currentInput]);
    }
    setHistoryIndex(-1);

    // Submit input (can be empty string for programs that accept empty input)
    onInputSubmit(currentInput);
    setCurrentInput('');
  }, [currentInput, onInputSubmit, isWaitingForInput]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputHistory.length > 0) {
        const newIndex = historyIndex === -1 ? inputHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(inputHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= inputHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(inputHistory[newIndex]);
        }
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      // Handle Ctrl+C to stop execution
      onInputSubmit('__STOP__');
    }
  }, [inputHistory, historyIndex, onInputSubmit]);

  const handleInputChange = useCallback((e) => {
    setCurrentInput(e.target.value);
  }, []);

  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm min-h-32 max-h-96 overflow-y-auto"
         style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
         ref={consoleRef}>
      
      {/* Console Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400 text-xs ml-2">Terminal</span>
        </div>
        <button
          onClick={onClearConsole}
          className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Console Lines */}
      <div className="space-y-1">
        {consoleLines.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No output yet. Write your code and click "Run Code" to execute.
          </div>
        ) : (
          consoleLines.map((line, index) => (
            <div key={index} className={`${
              line.type === 'error' ? 'text-red-400' :
              line.type === 'system' ? 'text-yellow-400' :
              line.type === 'user-input' ? 'text-blue-400' :
              line.type === 'input' ? 'text-green-300' :
              'text-green-400'
            }`}>
              {line.type === 'input' && (
                <span className="inline-flex items-center">
                  {line.content}
                  {isWaitingForInput && (
                    <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                      █
                    </span>
                  )}
                </span>
              )}
              {line.type !== 'input' && (
                <span className="whitespace-pre-wrap">{line.content}</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Field */}
      {isWaitingForInput && (
        <form onSubmit={handleInputSubmit} className="flex items-center mt-2">
          <span className="text-green-300 mr-2 select-none">{'>>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-green-400 flex-1 font-mono"
            placeholder="Type input and press Enter..."
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
          {isWaitingForInput && (
            <span className={`text-green-300 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
              █
            </span>
          )}
        </form>
      )}

      {/* Running indicator */}
      {isRunning && !isWaitingForInput && (
        <div className="flex items-center space-x-2 mt-2 text-yellow-400">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400"></div>
          <span className="text-sm">Executing...</span>
        </div>
      )}
    </div>
  );
});

ConsoleTerminal.displayName = 'ConsoleTerminal';

export default ConsoleTerminal;
