# Terminal Component Import Guide

## Overview
The terminal component can be imported in multiple ways for better flexibility and reusability.

## Import Methods

### Method 1: Direct Import (Original)
```javascript
import ConsoleTerminal from './components/ConsoleTerminal';
```

### Method 2: From Terminal Index (Recommended)
```javascript
// Default import
import ConsoleTerminal from './components/Terminal';

// Named import
import { ConsoleTerminal } from './components/Terminal';

// Alternative names
import { Terminal } from './components/Terminal';
import { CodeTerminal } from './components/Terminal';
```

### Method 3: Multiple Named Imports
```javascript
import { 
  ConsoleTerminal, 
  Terminal, 
  CodeTerminal 
} from './components/Terminal';
```

## Usage Examples

### Basic Usage
```jsx
import ConsoleTerminal from './components/Terminal';

function MyComponent() {
  const [consoleLines, setConsoleLines] = useState([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);

  return (
    <ConsoleTerminal
      isWaitingForInput={isWaitingForInput}
      onInputSubmit={(input) => {
        console.log('User input:', input);
        // Handle input
      }}
      consoleLines={consoleLines}
      onClearConsole={() => setConsoleLines([])}
      isRunning={false}
    />
  );
}
```

### With Ref (Advanced)
```jsx
import { Terminal } from './components/Terminal';
import { useRef } from 'react';

function MyComponent() {
  const terminalRef = useRef(null);

  const handleLanguageChange = () => {
    // Reset terminal when language changes
    if (terminalRef.current) {
      terminalRef.current.reset();
    }
  };

  return (
    <Terminal
      ref={terminalRef}
      isWaitingForInput={isWaitingForInput}
      onInputSubmit={handleInputSubmit}
      consoleLines={consoleLines}
      onClearConsole={handleClearConsole}
      isRunning={isRunning}
    />
  );
}
```

## Terminal Reset for Language Changes

The terminal now automatically resets when:
1. Language changes
2. Code is cleared
3. Console is cleared
4. New execution starts

The `executionService` has a `reset()` method that clears all state:
```javascript
import executionService from './services/executionService';

// Reset execution service state
executionService.reset();
```

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isWaitingForInput` | boolean | Yes | Whether the program is waiting for user input |
| `onInputSubmit` | function | Yes | Callback when user submits input |
| `consoleLines` | array | Yes | Array of console output lines |
| `onClearConsole` | function | Yes | Callback to clear console |
| `isRunning` | boolean | No | Whether code is currently executing |

## Console Line Format

Each line in `consoleLines` should have this format:
```javascript
{
  type: 'output' | 'error' | 'system' | 'user-input' | 'input',
  content: string,
  timestamp?: number // optional
}
```

## Exposed Methods (via ref)

When using a ref, you can call these methods:

### `reset()`
Resets the terminal's internal state (input, history, cursor).

### `focus()`
Focuses the input field if waiting for input.

## Best Practices

1. **Always reset on language change**: Call `executionService.reset()` when switching languages
2. **Use the Terminal index**: Import from `./components/Terminal` for better flexibility
3. **Clear console on new run**: Reset console lines when starting a new execution
4. **Handle input properly**: Always check `isWaitingForInput` before processing input

## Example: Complete Integration

```jsx
import { useState, useEffect } from 'react';
import { Terminal } from './components/Terminal';
import executionService from './services/executionService';

function CodePlayground() {
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [consoleLines, setConsoleLines] = useState([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Reset on language change
  useEffect(() => {
    executionService.reset();
    setConsoleLines([]);
    setIsWaitingForInput(false);
  }, [selectedLanguage]);

  const handleRun = async () => {
    executionService.reset(); // Reset for fresh run
    setIsRunning(true);
    // ... execute code
  };

  const handleInputSubmit = (input) => {
    // Process input
    if (input === '__STOP__') {
      executionService.stopExecution();
      setIsWaitingForInput(false);
      return;
    }
    // Continue execution with input
  };

  return (
    <Terminal
      isWaitingForInput={isWaitingForInput}
      onInputSubmit={handleInputSubmit}
      consoleLines={consoleLines}
      onClearConsole={() => {
        executionService.reset();
        setConsoleLines([]);
      }}
      isRunning={isRunning}
    />
  );
}
```


