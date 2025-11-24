import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Button from "./base/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Play, Loader2, Trash2, Home, AlertCircle, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import executionService from "../services/executionService";
import { getAllLanguageNames, getLanguageByName, getDefaultCode, getMonacoLanguage } from "../utils/languageMap";

interface ConsoleLine {
  type: "output" | "input" | "error" | "prompt";
  text: string;
}

interface CodePlaygroundProps {
  onBack?: () => void;
}

export default function CodePlayground({ onBack }: CodePlaygroundProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const [code, setCode] = useState(getDefaultCode("Python"));
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [collectedInputs, setCollectedInputs] = useState<string[]>([]);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);
  const waitingForInputRef = useRef<boolean>(false);
  const consoleAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLines]);

  // Update ref when state changes
  useEffect(() => {
    waitingForInputRef.current = waitingForInput;
  }, [waitingForInput]);

  useEffect(() => {
    if (waitingForInput) {
      // Disable editor when waiting for input
      if (editorRef.current) {
        editorRef.current.updateOptions({ readOnly: true });
        // Blur the editor to remove focus - get DOM node and blur it
        const editorDomNode = editorRef.current.getDomNode();
        if (editorDomNode) {
          const textArea = editorDomNode.querySelector('textarea') as HTMLTextAreaElement;
          if (textArea) {
            textArea.blur();
          }
          // Also blur the container
          (editorDomNode as HTMLElement).blur();
        }
        // Blur active element if it's within the editor
        if (document.activeElement && editorDomNode?.contains(document.activeElement)) {
          (document.activeElement as HTMLElement).blur();
        }
      }
      
      // Auto-focus the console area and input when waiting for input
      setTimeout(() => {
        if (consoleAreaRef.current) {
          consoleAreaRef.current.focus();
        }
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      // Re-enable editor when not waiting for input
      if (editorRef.current) {
        editorRef.current.updateOptions({ readOnly: false });
      }
    }
  }, [waitingForInput]);

  // Blinking cursor effect
  useEffect(() => {
    let cursorInterval: NodeJS.Timeout;
    if (waitingForInput) {
      cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
    } else {
      setShowCursor(true);
    }

    return () => {
      if (cursorInterval) {
        clearInterval(cursorInterval);
      }
    };
  }, [waitingForInput]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!waitingForInput) return;
      
      // Check if the event is coming from the editor
      const target = e.target as HTMLElement;
      const isFromEditor = target.closest('.monaco-editor') !== null;
      
      // If event is from editor, prevent it and stop propagation
      if (isFromEditor) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
      
      // Only handle events when waiting for input and not from editor
      if (waitingForInput && !isFromEditor) {
        // Prevent default behavior for all keys when waiting for input
        if (e.key !== 'Tab' && !(e.ctrlKey && e.key === 'c')) {
          // Allow Tab for accessibility, Ctrl+C for stopping
          if (!(e.ctrlKey || e.metaKey) || e.key === 'c') {
            e.preventDefault();
            e.stopPropagation();
          }
        }
        
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (currentInput.trim() || waitingForInput) {
            // Add to input history if input is not empty
            if (currentInput.trim()) {
              setInputHistory(prev => [...prev, currentInput]);
            }
            setHistoryIndex(-1);
            
            // Use the current input (don't collect multiple, execute immediately)
            const inputToSubmit = currentInput.trim();
            setCurrentInput("");
            
            // Execute with the input
            setWaitingForInput(false);
            executeCode(inputToSubmit);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          if (waitingForInput && inputHistory.length > 0) {
            const newIndex = historyIndex === -1 ? inputHistory.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setCurrentInput(inputHistory[newIndex]);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          if (waitingForInput) {
            const newIndex = historyIndex + 1;
            if (newIndex >= inputHistory.length) {
              setHistoryIndex(-1);
              setCurrentInput("");
            } else {
              setHistoryIndex(newIndex);
              setCurrentInput(inputHistory[newIndex]);
            }
          }
        } else if (e.key === 'c' && e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          // Handle Ctrl+C to stop execution
          setWaitingForInput(false);
          setConsoleLines(prev => [...prev, { type: "prompt", text: "Execution stopped by user." }]);
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Handle regular character input (only if no modifiers)
          e.preventDefault();
          e.stopPropagation();
          setCurrentInput(prev => prev + e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          e.stopPropagation();
          // Handle backspace
          setCurrentInput(prev => prev.slice(0, -1));
        }
      }
    };

    if (waitingForInput) {
      // Use capture phase to intercept events before they reach editor
      document.addEventListener('keydown', handleKeyPress, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [waitingForInput, currentInput, collectedInputs, inputHistory, historyIndex]);

  useEffect(() => {
    console.log('Selected language changed to:', selectedLanguage);
    // Ensure terminal state is reset when language changes
    executionService.reset();
    setConsoleLines([]);
    setCollectedInputs([]);
    setWaitingForInput(false);
    setCurrentInput("");
    setInputHistory([]);
    setHistoryIndex(-1);
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: false });
    }
  }, [selectedLanguage]);

  const handleLanguageChange = (langName: string) => {
    console.log('Language changed to:', langName);
    console.log('Current selectedLanguage before change:', selectedLanguage);
    
    // Reset execution service state for new language
    executionService.reset();
    
    setSelectedLanguage(langName);
    setCode(getDefaultCode(langName));
    setConsoleLines([]);
    setCollectedInputs([]);
    setWaitingForInput(false);
    setCurrentInput("");
    setInputHistory([]);
    setHistoryIndex(-1);
    
    // Re-enable editor if it was disabled
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: false });
    }
  };

  const handleZoomIn = () => {
    const newSize = Math.min(fontSize + 2, 32);
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  const handleZoomOut = () => {
    const newSize = Math.max(fontSize - 2, 8);
    setFontSize(newSize);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  const handleResetZoom = () => {
    setFontSize(14);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: 14 });
    }
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts for zoom
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
      if (!waitingForInput) {
        handleZoomIn();
      }
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
      if (!waitingForInput) {
        handleZoomOut();
      }
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0, () => {
      if (!waitingForInput) {
        handleResetZoom();
      }
    });
    
    // Additional zoom shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      if (!waitingForInput) {
        handleZoomIn();
      }
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM, () => {
      if (!waitingForInput) {
        handleZoomOut();
      }
    });
    
    // Mouse wheel zoom (Ctrl + Scroll)
    editor.onMouseWheel((e: any) => {
      if (waitingForInput) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    });
    
    // Prevent keyboard input when waiting for input
    const editorContainer = editor.getDomNode();
    if (editorContainer) {
      // Intercept all keyboard events when waiting for input
      const keydownHandler = (e: KeyboardEvent) => {
        // Use ref to get current state value
        if (waitingForInputRef.current) {
          // Prevent all keyboard input to editor when waiting for input
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          // Blur editor and focus console
          const editorDomNode = editor.getDomNode();
          if (editorDomNode) {
            const textArea = editorDomNode.querySelector('textarea') as HTMLTextAreaElement;
            if (textArea) {
              textArea.blur();
            }
            (editorDomNode as HTMLElement).blur();
          }
          // Blur active element if it's within the editor
          if (document.activeElement && editorContainer.contains(document.activeElement)) {
            (document.activeElement as HTMLElement).blur();
          }
          
          const consoleArea = document.querySelector('[tabindex="0"]') as HTMLElement;
          if (consoleArea) {
            consoleArea.focus();
          }
          return false;
        }
        
        // Prevent browser zoom when editor is focused
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.key === '-')) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      editorContainer.addEventListener('keydown', keydownHandler, true);
      
      // Also prevent click focus when waiting for input
      const clickHandler = (e: MouseEvent) => {
        // Use ref to get current state value
        if (waitingForInputRef.current) {
          e.preventDefault();
          e.stopPropagation();
          
          // Blur editor
          const editorDomNode = editor.getDomNode();
          if (editorDomNode) {
            const textArea = editorDomNode.querySelector('textarea') as HTMLTextAreaElement;
            if (textArea) {
              textArea.blur();
            }
            (editorDomNode as HTMLElement).blur();
          }
          // Blur active element if it's within the editor
          if (document.activeElement && editorContainer.contains(document.activeElement)) {
            (document.activeElement as HTMLElement).blur();
          }
          
          const consoleArea = document.querySelector('[tabindex="0"]') as HTMLElement;
          if (consoleArea) {
            consoleArea.focus();
          }
        }
      };
      
      editorContainer.addEventListener('mousedown', clickHandler, true);
      
      // Store handlers for cleanup
      (editorContainer as any)._keydownHandler = keydownHandler;
      (editorContainer as any)._clickHandler = clickHandler;
    }
  };

  const detectInputRequirement = (sourceCode: string): boolean => {
    const inputPatterns = [
      /scanf\s*\(/i,
      /cin\s*>>/i,
      /input\s*\(/i,
      /readLine\s*\(/i,
      /Scanner/i,
      /readline\.question/i
    ];
    return inputPatterns.some(pattern => pattern.test(sourceCode));
  };

  const executeCode = async (stdin: string = "") => {
    setIsRunning(true);
    const isFirstRun = stdin === "";
    
    // Only show "Compiling" message on first run
    if (isFirstRun) {
      setConsoleLines(prev => [...prev, { type: "output", text: "⚡ Compiling and running..." }]);
    }

    // If we have input, append it to the last prompt line (inline format like second image)
    if (!isFirstRun && stdin) {
      setConsoleLines(prev => {
        const newLines = [...prev];
        // Find the last output/prompt line and append input to it
        for (let i = newLines.length - 1; i >= 0; i--) {
          if (newLines[i].type === "output" || newLines[i].type === "prompt") {
            const lastLine = newLines[i].text.trim();
            // Append input inline to the prompt (matching second image format)
            if (lastLine.endsWith(':') || lastLine.endsWith('?') || lastLine.match(/^(Enter|Input|Type|Number|Please)/i)) {
              newLines[i] = {
                ...newLines[i],
                text: newLines[i].text.trim() + ' ' + stdin
              };
            }
            break;
          }
        }
        return newLines;
      });
    }

    try {
      console.log('Executing code:', {
        language: selectedLanguage,
        codeLength: code.length,
        stdinLength: stdin.length,
        isFirstRun: isFirstRun
      });

      const result = await executionService.executeCode(code, selectedLanguage, stdin, isFirstRun);
      
      // Remove "Compiling" message
      setConsoleLines(prev => prev.filter(line => !line.text.includes("Compiling")));

      // Handle first run (showing first prompt)
      if (isFirstRun && result.needsInput) {
        // Display only the first prompt (remove "Program is waiting for input" type messages)
        if (result.output && result.output.trim()) {
          const outputText = result.output.trim();
          // Filter out generic waiting messages
          if (!outputText.toLowerCase().includes('program is waiting for input') && 
              !outputText.toLowerCase().includes('waiting for input')) {
            // Show the prompt line by line
            const promptLines = outputText.split('\n');
            promptLines.forEach(line => {
              const trimmedLine = line.trim();
              if (trimmedLine && !trimmedLine.toLowerCase().includes('program is waiting')) {
                setConsoleLines(prev => [...prev, { type: "output", text: trimmedLine }]);
              }
            });
          } else {
            // If only generic message, try to get prompt from promptOutput
            if (result.promptOutput && result.promptOutput.trim()) {
              setConsoleLines(prev => [...prev, { type: "output", text: result.promptOutput.trim() }]);
            }
          }
        }
        
        // Set waiting for input state
        setWaitingForInput(true);
        setCollectedInputs([]);
        
        // Ensure editor is disabled and console is focused
        if (editorRef.current) {
          editorRef.current.updateOptions({ readOnly: true });
          const editorDomNode = editorRef.current.getDomNode();
          if (editorDomNode) {
            const textArea = editorDomNode.querySelector('textarea') as HTMLTextAreaElement;
            if (textArea) {
              textArea.blur();
            }
            (editorDomNode as HTMLElement).blur();
            if (document.activeElement && editorDomNode.contains(document.activeElement)) {
              (document.activeElement as HTMLElement).blur();
            }
          }
        }
        
        // Focus console area and input
        setTimeout(() => {
          if (consoleAreaRef.current) {
            consoleAreaRef.current.focus();
          }
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
        return; // Exit early, waiting for user input
      }


      // Display output or error
      // For sequential inputs, this will be either:
      // 1. The next prompt (if needsInput is true)
      // 2. The final result (if isComplete is true)
      if (result.needsInput) {
        // Show the next prompt only (filter out generic messages)
        if (result.output && result.output.trim()) {
          const outputText = result.output.trim();
          // Filter out generic waiting messages
          if (!outputText.toLowerCase().includes('program is waiting for input') && 
              !outputText.toLowerCase().includes('waiting for input')) {
            const promptLines = outputText.split('\n');
            promptLines.forEach(line => {
              const trimmedLine = line.trim();
              if (trimmedLine && !trimmedLine.toLowerCase().includes('program is waiting')) {
                setConsoleLines(prev => [...prev, { type: "output", text: trimmedLine }]);
              }
            });
          } else if (result.promptOutput && result.promptOutput.trim()) {
            // Use promptOutput if available
            setConsoleLines(prev => [...prev, { type: "output", text: result.promptOutput.trim() }]);
          }
        }
        
        setWaitingForInput(true);
        setCollectedInputs([]);
        
        // Ensure editor is disabled and console is focused
        if (editorRef.current) {
          editorRef.current.updateOptions({ readOnly: true });
          const editorDomNode = editorRef.current.getDomNode();
          if (editorDomNode) {
            const textArea = editorDomNode.querySelector('textarea') as HTMLTextAreaElement;
            if (textArea) {
              textArea.blur();
            }
            (editorDomNode as HTMLElement).blur();
            if (document.activeElement && editorDomNode.contains(document.activeElement)) {
              (document.activeElement as HTMLElement).blur();
            }
          }
        }
        
        // Focus console area and input
        setTimeout(() => {
          if (consoleAreaRef.current) {
            consoleAreaRef.current.focus();
          }
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      } else if (result.success && result.output) {
        // Program completed - show the final output
        const outputLines = result.output.trim().split('\n');
        outputLines.forEach(line => {
          if (line.trim()) {
            setConsoleLines(prev => [...prev, { type: "output", text: line }]);
          }
        });
        
        setWaitingForInput(false);
        setCollectedInputs([]);
        if (editorRef.current) {
          editorRef.current.updateOptions({ readOnly: false });
        }
        
        // Display completion message (matching second image format)
        setConsoleLines(prev => [...prev, { type: "prompt", text: `=== Code Execution Successful ===` }]);
      } else if (result.error && result.error.trim()) {
        // Show error
        setConsoleLines(prev => [...prev, { type: "error", text: result.error }]);
        setWaitingForInput(false);
        setCollectedInputs([]);
        if (editorRef.current) {
          editorRef.current.updateOptions({ readOnly: false });
        }
      } else if (result.success && result.isComplete) {
        // Program completed with no output
        setWaitingForInput(false);
        setCollectedInputs([]);
        if (editorRef.current) {
          editorRef.current.updateOptions({ readOnly: false });
        }
        
        // Display completion message (matching second image format)
        setConsoleLines(prev => [...prev, { type: "prompt", text: `=== Code Execution Successful ===` }]);
      }

      // Display execution time and memory
      if (result.time && result.isComplete) {
        setConsoleLines(prev => [...prev, { type: "prompt", text: `⏱️  Time: ${result.time}s | Memory: ${result.memory || 'N/A'} KB` }]);
      }

    } catch (error: any) {
      console.error('Execution error:', error);
      setConsoleLines(prev => [
        ...prev.filter(line => !line.text.includes("Compiling")),
        { type: "error", text: `❌ Error: ${error.message}` }
      ]);
      setWaitingForInput(false);
      setCollectedInputs([]);
      if (editorRef.current) {
        editorRef.current.updateOptions({ readOnly: false });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = () => {
    // Reset execution service state for fresh run
    executionService.reset();
    
    // Reset input state
    setConsoleLines([]);
    setCollectedInputs([]);
    setWaitingForInput(false);
    setCurrentInput("");
    setInputHistory([]);
    setHistoryIndex(-1);
    
    // Re-enable editor if it was disabled
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: false });
    }
    
    const needsInput = detectInputRequirement(code);
    
    if (needsInput) {
      // First run to show the program's prompt
      executeCode();
    } else {
      executeCode();
    }
  };



  const handleClear = () => {
    // Reset execution service state
    executionService.reset();
    
    setConsoleLines([]);
    setCollectedInputs([]);
    setWaitingForInput(false);
    setCurrentInput("");
    setInputHistory([]);
    setHistoryIndex(-1);
    
    // Re-enable editor
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: false });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Play className="w-6 h-6 text-purple-400" />
          <h1 className="text-white text-xl">Interactive Code Playground</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </>
            )}
          </Button>
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Container */}
        <div className="flex-1 border-r border-white/10 flex flex-col">
          {/* Editor Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-800/50">
            <div className="flex items-center gap-4">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue value={selectedLanguage} placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {getAllLanguageNames().map(langName => (
                    <SelectItem key={langName} value={langName}>
                      {langName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
              <Button
                onClick={handleZoomOut}
                size="sm"
                className="bg-transparent hover:bg-slate-600 text-white p-2"
                title="Zoom Out (Ctrl+- or Ctrl+M or Ctrl+Scroll Down)"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white/70 text-sm px-2 min-w-[3rem] text-center">
                {fontSize}px
              </span>
              <Button
                onClick={handleZoomIn}
                size="sm"
                className="bg-transparent hover:bg-slate-600 text-white p-2"
                title="Zoom In (Ctrl++ or Ctrl+P or Ctrl+Scroll Up)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleResetZoom}
                size="sm"
                className="bg-transparent hover:bg-slate-600 text-white p-2"
                title="Reset Zoom (Ctrl+0)"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={getMonacoLanguage(selectedLanguage)}
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                readOnly: waitingForInput || isRunning
              }}
            />
            {/* Overlay when waiting for input */}
            {waitingForInput && (
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 cursor-not-allowed"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const consoleArea = document.querySelector('[tabindex="0"]') as HTMLElement;
                  if (consoleArea) {
                    consoleArea.focus();
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="bg-yellow-900/90 border border-yellow-600 rounded-lg p-4 text-yellow-200 text-center max-w-md mx-4">
                  <div className="text-lg font-semibold mb-2">🔒 Editor Locked</div>
                  <div className="text-sm">
                    Program is waiting for input. Type in the terminal below.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Console */}
        <div className="w-[500px] flex flex-col bg-gray-900">
          {/* Console Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-gray-400 text-sm">Terminal</span>
            </div>
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Console Output */}
          <div 
            ref={consoleAreaRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm focus:outline-none bg-gray-900 text-green-400 cursor-text"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            tabIndex={0}
            onClick={(e) => {
              // When waiting for input, clicking anywhere on console should focus input
              if (waitingForInput) {
                e.preventDefault();
                e.stopPropagation();
                // Focus the input field
                if (inputRef.current) {
                  inputRef.current.focus();
                } else {
                  // If no input ref, focus the console area itself
                  if (consoleAreaRef.current) {
                    consoleAreaRef.current.focus();
                  }
                }
              }
            }}
            onFocus={() => {
              if (waitingForInput) {
                console.log('Console area focused for input');
                // Ensure editor is blurred when console gets focus
                if (editorRef.current) {
                  // Blur editor properly
                  const editorDomNode = editorRef.current.getDomNode();
                  if (editorDomNode) {
                    const textArea = editorDomNode.querySelector('textarea') as HTMLTextAreaElement;
                    if (textArea) {
                      textArea.blur();
                    }
                    (editorDomNode as HTMLElement).blur();
                    if (document.activeElement && editorDomNode.contains(document.activeElement)) {
                      (document.activeElement as HTMLElement).blur();
                    }
                  }
                }
                // Focus input if available
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }, 50);
              }
            }}
            onKeyDown={(e) => {
              // Prevent event from bubbling to document listener if not waiting for input
              if (!waitingForInput) {
                e.stopPropagation();
              }
            }}
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
                  line.type === "error"
                    ? "text-red-400"
                    : line.type === "input"
                    ? "text-blue-400"
                    : line.type === "prompt"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {line.text}
              </div>
            ))}
            {waitingForInput && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (currentInput.trim() || waitingForInput) {
                    const inputToSubmit = currentInput.trim();
                    setCurrentInput("");
                    setWaitingForInput(false);
                    executeCode(inputToSubmit);
                  }
                }}
                className="flex items-center gap-2 mb-1"
                onClick={(e) => {
                  // Focus input when form is clicked
                  e.stopPropagation();
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <span className="text-green-300 font-mono">&gt;&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
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
                          setCurrentInput("");
                        } else {
                          setHistoryIndex(newIndex);
                          setCurrentInput(inputHistory[newIndex]);
                        }
                      }
                    }
                  }}
                  className="bg-transparent border-none outline-none text-green-400 flex-1 font-mono min-w-0"
                  placeholder="Type input and press Enter..."
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  style={{ width: '100%' }}
                />
                <span className={`text-green-300 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                  █
                </span>
              </form>
            )}
            <div ref={consoleEndRef} />
          </div>

        </div>
      </div>
    </div>
  );
}
