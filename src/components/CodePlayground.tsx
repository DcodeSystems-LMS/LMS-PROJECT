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

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLines]);

  useEffect(() => {
    if (waitingForInput) {
      // Auto-focus the console area when waiting for input
      const consoleArea = document.querySelector('[tabindex="0"]') as HTMLElement;
      if (consoleArea) {
        consoleArea.focus();
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
      if (waitingForInput) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (currentInput.trim()) {
            // Add to input history
            setInputHistory(prev => [...prev, currentInput]);
            setHistoryIndex(-1);
            
            // Collect input and execute immediately
            const newInputs = [...collectedInputs, currentInput];
            setCollectedInputs(newInputs);
            setConsoleLines(prev => [...prev, { type: "input", text: `>> ${currentInput}` }]);
            setCurrentInput("");
            
            // Execute with collected inputs
            setWaitingForInput(false);
            const stdin = newInputs.join('\n');
            executeCode(stdin);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (waitingForInput && inputHistory.length > 0) {
            const newIndex = historyIndex === -1 ? inputHistory.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setCurrentInput(inputHistory[newIndex]);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
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
          // Handle Ctrl+C to stop execution
          setWaitingForInput(false);
          setConsoleLines(prev => [...prev, { type: "prompt", text: "Execution stopped by user." }]);
        } else if (e.key.length === 1) {
          // Handle regular character input
          setCurrentInput(prev => prev + e.key);
        } else if (e.key === 'Backspace') {
          // Handle backspace
          setCurrentInput(prev => prev.slice(0, -1));
        }
      }
    };

    if (waitingForInput) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [waitingForInput, currentInput, collectedInputs, inputHistory, historyIndex]);

  useEffect(() => {
    console.log('Selected language changed to:', selectedLanguage);
  }, [selectedLanguage]);

  const handleLanguageChange = (langName: string) => {
    console.log('Language changed to:', langName);
    console.log('Current selectedLanguage before change:', selectedLanguage);
    setSelectedLanguage(langName);
    setCode(getDefaultCode(langName));
    setConsoleLines([]);
    setCollectedInputs([]);
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

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts for zoom
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
      handleZoomIn();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
      handleZoomOut();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0, () => {
      handleResetZoom();
    });
    
    // Additional zoom shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      handleZoomIn();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM, () => {
      handleZoomOut();
    });
    
    // Mouse wheel zoom (Ctrl + Scroll)
    editor.onMouseWheel((e: any) => {
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
    
    // Prevent browser zoom when editor is focused
    const editorContainer = editor.getDomNode();
    if (editorContainer) {
      editorContainer.addEventListener('keydown', (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.key === '-')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
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
    setConsoleLines(prev => [...prev, { type: "output", text: "⚡ Compiling and running..." }]);

    try {
      console.log('Executing code:', {
        language: selectedLanguage,
        codeLength: code.length,
        stdinLength: stdin.length,
        isFirstRun: stdin === ""
      });

      const result = await executionService.executeCode(code, selectedLanguage, stdin, stdin === "");
      
      setConsoleLines(prev => prev.filter(line => !line.text.includes("Compiling")));

      // Display the input that was provided (if any)
      if (stdin) {
        setConsoleLines(prev => [...prev, { type: "prompt", text: "--- Input provided ---" }]);
        const inputLines = stdin.split('\n');
        inputLines.forEach(line => {
          setConsoleLines(prev => [...prev, { type: "input", text: line }]);
        });
        setConsoleLines(prev => [...prev, { type: "prompt", text: "--- Program output ---" }]);
      }

      // Display output or error
      if (result.success && result.output) {
        const lines = result.output.trim().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            setConsoleLines(prev => [...prev, { type: "output", text: line }]);
          }
        });
      } else if (result.error) {
        setConsoleLines(prev => [...prev, { type: "error", text: result.error }]);
      }

      // Handle input requirements
      if (result.needsInput) {
        setWaitingForInput(true);
        setConsoleLines(prev => [...prev, { type: "prompt", text: "Program is waiting for input. Type your input and press Enter to execute." }]);
      } else if (result.success && result.isComplete) {
        // Program completed successfully
        setWaitingForInput(false);
      } else if (result.error && result.error.includes('EOFError')) {
        // Handle EOFError as waiting for input
        setWaitingForInput(true);
        setConsoleLines(prev => [...prev, { type: "prompt", text: "Program is waiting for input. Type your input and press Enter to execute." }]);
      }

      // Display execution status
      if (result.success && result.isComplete) {
        setConsoleLines(prev => [...prev, { type: "prompt", text: `✓ Execution completed successfully` }]);
      } else if (!result.success) {
        setConsoleLines(prev => [...prev, { type: "error", text: `Execution failed` }]);
      }

      // Display execution time and memory
      if (result.time) {
        setConsoleLines(prev => [...prev, { type: "prompt", text: `⏱️  Time: ${result.time}s | Memory: ${result.memory || 'N/A'} KB` }]);
      }

    } catch (error: any) {
      console.error('Execution error:', error);
      setConsoleLines(prev => [
        ...prev.filter(line => !line.text.includes("Compiling")),
        { type: "error", text: `❌ Error: ${error.message}` }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = () => {
    setConsoleLines([]);
    setCollectedInputs([]);
    
    const needsInput = detectInputRequirement(code);
    
    if (needsInput) {
      // First run to show the program's prompt
      executeCode();
    } else {
      executeCode();
    }
  };



  const handleClear = () => {
    setConsoleLines([]);
    setCollectedInputs([]);
    setWaitingForInput(false);
    setCurrentInput("");
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
          <div className="flex-1">
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
                wordWrap: "on"
              }}
            />
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
            className="flex-1 overflow-y-auto p-4 font-mono text-sm focus:outline-none bg-gray-900 text-green-400"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            tabIndex={0}
            onFocus={() => {
              if (waitingForInput) {
                console.log('Console area focused for input');
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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-300 font-mono">&gt;&gt;</span>
                <span className="text-green-400 font-mono">
                  {currentInput || "Waiting for input... (Type and press Enter)"}
                  <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                    █
                  </span>
                </span>
              </div>
            )}
            <div ref={consoleEndRef} />
          </div>

        </div>
      </div>
    </div>
  );
}
