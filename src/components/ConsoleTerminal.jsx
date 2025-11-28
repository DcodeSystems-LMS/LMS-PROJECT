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
  
  const consoleRef = useRef(null);
  const inputRef = useRef(null);
  const currentInputRef = useRef(''); // Keep ref for latest input value

  // Expose reset method via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      setCurrentInput('');
      currentInputRef.current = '';
      setInputHistory([]);
      setHistoryIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
        inputRef.current.value = '';
      }
    },
    focus: () => {
      if (inputRef.current && isWaitingForInput) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 100);
      }
    }
  }));

  // Reset terminal state when console is cleared (consoleLines becomes empty)
  useEffect(() => {
    if (consoleLines.length === 0 && !isWaitingForInput) {
      setCurrentInput('');
      currentInputRef.current = '';
      setInputHistory([]);
      setHistoryIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
        inputRef.current.value = '';
      }
    }
  }, [consoleLines.length, isWaitingForInput]);

  // Reset input state when no longer waiting for input
  useEffect(() => {
    if (!isWaitingForInput) {
      setCurrentInput('');
      currentInputRef.current = '';
      setHistoryIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
        inputRef.current.value = '';
      }
    }
  }, [isWaitingForInput]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLines]);

  // Focus input when waiting for input - ensure it's focused properly
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      // Use setTimeout to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Ensure input is selected/ready for typing
          inputRef.current.select();
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [isWaitingForInput]);

  const handleInputSubmit = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Get input value from multiple sources (most reliable)
    let inputValue = '';
    if (inputRef.current) {
      // Read directly from DOM (most reliable)
      inputValue = inputRef.current.value || '';
    }
    // Fallback to ref or state
    if (!inputValue) {
      inputValue = currentInputRef.current || currentInput || '';
    }
    
    console.log('🔍 handleInputSubmit called:', {
      isWaitingForInput,
      currentInput,
      refValue: currentInputRef.current,
      domValue: inputRef.current?.value,
      finalValue: inputValue,
      hasCallback: !!onInputSubmit
    });
    
    // Only submit if we're waiting for input
    if (!isWaitingForInput) {
      console.warn('⚠️ Input submit called but not waiting for input');
      return;
    }

    if (!onInputSubmit) {
      console.error('❌ onInputSubmit callback is not defined!');
      return;
    }

    // Use the input value we found
    const inputToSubmit = inputValue;
    console.log('📥 Submitting input:', inputToSubmit);

    // Clear input immediately to prevent double submission
    setCurrentInput('');
    currentInputRef.current = '';
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Add to input history (even if empty, for tracking)
    if (inputToSubmit.trim()) {
      setInputHistory(prev => [...prev, inputToSubmit]);
    }
    setHistoryIndex(-1);
    
    // Call the callback with the input value
    console.log('📤 Calling onInputSubmit with:', inputToSubmit);
    try {
      onInputSubmit(inputToSubmit);
      console.log('✅ onInputSubmit called successfully');
    } catch (error) {
      console.error('❌ Error calling onInputSubmit:', error);
    }
  }, [currentInput, onInputSubmit, isWaitingForInput]);

  const handleKeyDown = useCallback((e) => {
    // Handle Enter key to submit
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      console.log('⌨️ Enter key pressed, currentInput:', currentInput);
      // Call handleInputSubmit directly
      handleInputSubmit(e);
      return;
    }
    
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
      if (onInputSubmit) {
        onInputSubmit('__STOP__');
      }
    }
  }, [inputHistory, historyIndex, onInputSubmit, handleInputSubmit]);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setCurrentInput(newValue);
    currentInputRef.current = newValue; // Update ref
    console.log('✏️ Input changed:', newValue);
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
          consoleLines.map((line, index) => {
            // Support both 'content' and 'text' properties for compatibility
            const lineText = line.content || line.text || '';
            return (
              <div key={index} className={`${
                line.type === 'error' ? 'text-red-400' :
                line.type === 'system' ? 'text-yellow-400' :
                line.type === 'user-input' ? 'text-blue-400' :
                line.type === 'input' ? 'text-green-300' :
                line.type === 'prompt' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {line.type === 'input' && (
                  <span className="inline-flex items-center">
                    {lineText}
                  </span>
                )}
                {line.type !== 'input' && (
                  <span className="whitespace-pre-wrap">{lineText}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Field - Appears directly in terminal output area */}
      {isWaitingForInput && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleInputSubmit(e);
          }}
          className="flex items-center mt-2 pt-2 border-t border-gray-700"
          style={{ minHeight: '40px' }}
        >
          <span className="text-green-300 mr-2 select-none font-mono">{'>>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-green-400 flex-1 font-mono text-sm focus:outline-none focus:ring-0 caret-green-400"
            placeholder="Type your input here and press Enter..."
            autoFocus
            autoComplete="off"
            spellCheck="false"
            style={{ minWidth: '200px', caretColor: '#4ade80' }}
            tabIndex={0}
          />
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
