import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Button from "./base/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Play, Loader2, Trash2, Home, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { useJudge0Runner } from "../hooks/useJudge0Runner";
import { getLanguages, type Language } from "../lib/judge0Client";
import { getAllLanguageNames, getLanguageByName, getLanguageId, getDefaultCode, getMonacoLanguage } from "../utils/languageMap";
import ConsoleTerminal from "./ConsoleTerminal";

interface ConsoleLine {
  type: "output" | "error" | "prompt" | "system";
  text: string;
}

interface CodePlaygroundProps {
  onBack?: () => void;
}

export default function CodePlayground({ onBack }: CodePlaygroundProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const [code, setCode] = useState(getDefaultCode("Python"));
  const [stdin, setStdin] = useState("");
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [fontSize, setFontSize] = useState(14);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const terminalRef = useRef<any>(null);
  
  // Use Judge0 runner hook
  const { run, isRunning, result, error, statusLabel, reset: resetRunner } = useJudge0Runner();

  // Auto-scroll console to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLines]);

  // Fetch languages from Judge0 on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages = await getLanguages();
        setAvailableLanguages(languages);
      } catch (err) {
        console.error('Failed to fetch languages from Judge0:', err);
        // Fallback to hardcoded languages
        setAvailableLanguages([]);
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    console.log('Selected language changed to:', selectedLanguage);
    resetRunner();
    setConsoleLines([]);
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: false });
    }
  }, [selectedLanguage, resetRunner]);

  const handleLanguageChange = (langName: string) => {
    console.log('Language changed to:', langName);
    resetRunner();
    setSelectedLanguage(langName);
    setCode(getDefaultCode(langName));
    setConsoleLines([]);
    setStdin("");
    if (terminalRef.current) {
      terminalRef.current.reset();
    }
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
  };

  // Handle result updates from Judge0
  useEffect(() => {
    if (result) {
      const newLines: ConsoleLine[] = [];
      
      // Show compilation error if present (highest priority)
      if (result.compile_output) {
        newLines.push({ type: "error", text: "=== Compilation Error ===" });
        const compileLines = result.compile_output.trim().split('\n');
        compileLines.forEach(line => {
          if (line.trim()) {
            newLines.push({ type: "error", text: line.trim() });
          }
        });
      }
      
      // Show stderr if present (runtime errors)
      if (result.stderr && !result.compile_output) {
        newLines.push({ type: "error", text: "=== Runtime Error ===" });
        const errorLines = result.stderr.trim().split('\n');
        errorLines.forEach(line => {
          if (line.trim()) {
            newLines.push({ type: "error", text: line.trim() });
          }
        });
      }
      
      // Show stdout if present (only if no errors)
      if (result.stdout && !result.compile_output && !result.stderr) {
        const outputLines = result.stdout.trim().split('\n');
        outputLines.forEach(line => {
          if (line.trim()) {
            newLines.push({ type: "output", text: line.trim() });
          }
        });
      }
      
      // Show message if present (often contains additional error details)
      if (result.message) {
        const messageLines = result.message.trim().split('\n');
        messageLines.forEach(line => {
          if (line.trim()) {
            newLines.push({ type: "error", text: line.trim() });
          }
        });
      }
      
      // Show status
      if (statusLabel) {
        if (statusLabel === 'Accepted') {
          newLines.push({ type: "system", text: `=== Code Execution Successful ===` });
        } else {
          newLines.push({ type: "error", text: `Status: ${statusLabel}` });
        }
      }
      
      // Show execution time and memory
      if (result.time !== null && result.time !== undefined) {
        const memoryStr = result.memory ? `${result.memory} KB` : 'N/A';
        newLines.push({ type: "system", text: `⏱️  Time: ${result.time}s | Memory: ${memoryStr}` });
      }
      
      setConsoleLines(newLines);
    }
  }, [result, statusLabel]);

  // Handle errors from Judge0
  useEffect(() => {
    if (error) {
      setConsoleLines(prev => [
        ...prev.filter(line => !line.text.includes("Compiling")),
        { type: "error", text: `❌ ${error}` }
      ]);
    }
  }, [error]);

  const handleRun = async () => {
    if (!code.trim()) {
      setConsoleLines([{ type: "error", text: "Please enter some code to run." }]);
      return;
    }

    // Get language ID
    const languageId = getLanguageId(selectedLanguage);
    if (!languageId) {
      setConsoleLines([{ type: "error", text: `Language "${selectedLanguage}" is not supported.` }]);
      return;
    }

    // Clear console and show compiling message
    setConsoleLines([{ type: "system", text: "⚡ Compiling and running..." }]);
    
    // Reset runner state
    resetRunner();
    
    // Run code with Judge0
    try {
      await run(languageId, code, stdin);
    } catch (err) {
      console.error('Execution error:', err);
      setConsoleLines(prev => [
        ...prev.filter(line => !line.text.includes("Compiling")),
        { type: "error", text: `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}` }
      ]);
    }
  };

  const handleClear = () => {
    resetRunner();
    setConsoleLines([]);
    setStdin("");
    
    // Reset terminal
    if (terminalRef.current) {
      terminalRef.current.reset();
    }
    
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
          <h1 className="text-white text-xl">Code Playground</h1>
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
        {/* Left Side: Editor and Input */}
        <div className="flex-1 flex flex-col border-r border-white/10">
          {/* Editor Container */}
          <div className="flex-1 flex flex-col">
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
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleResetZoom}
                  size="sm"
                  className="bg-transparent hover:bg-slate-600 text-white p-2"
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
                  readOnly: false
                }}
              />
            </div>
            
            {/* Stdin Input Area */}
            <div className="border-t border-white/10 bg-slate-800/50">
              <div className="px-4 py-2 border-b border-white/10">
                <label className="text-sm text-white/70">Standard Input (stdin)</label>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input for your program (one value per line)..."
                className="w-full h-24 px-4 py-2 bg-slate-900 text-white text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isRunning}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Output Terminal */}
        <div className="w-[500px] flex flex-col bg-gray-900">
          <ConsoleTerminal
            ref={terminalRef}
            key={selectedLanguage}
            isWaitingForInput={false}
            onInputSubmit={() => {}}
            consoleLines={consoleLines.map(line => ({ 
              type: line.type, 
              content: line.text,
              text: line.text
            }))}
            onClearConsole={handleClear}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
}
