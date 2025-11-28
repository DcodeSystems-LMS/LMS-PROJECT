# Playground Compilation & Execution System

## Overview

The code playground uses **Judge0 API** for compiling and executing code. Judge0 is an online code execution service that supports multiple programming languages.

---

## Primary Service: Judge0 API

### API Endpoint
- **Primary URL**: `https://ce.judge0.com`
- **API Type**: REST API
- **Method**: POST requests to `/submissions` endpoint

### How It Works

1. **Code Submission**:
   - Your code is sent to Judge0 API as a POST request
   - The request includes:
     - `source_code`: Your program code
     - `language_id`: Numeric ID representing the programming language
     - `stdin`: Input data for the program (if any)
     - Various execution limits (time, memory, etc.)

2. **Compilation & Execution**:
   - Judge0 compiles the code (if needed for compiled languages like C, C++, Java)
   - Executes the compiled/interpreted code
   - Returns the result with:
     - `stdout`: Program output
     - `stderr`: Error messages
     - `compile_output`: Compilation errors (if any)
     - `status`: Execution status
     - `time`: Execution time
     - `memory`: Memory usage

3. **Result Processing**:
   - The playground formats the Judge0 response
   - Handles errors (compilation errors, runtime errors)
   - Detects if program is waiting for input (EOF errors)
   - Displays output in the terminal

---

## Service Architecture

### 1. **Judge0Service** (`src/services/judge0Service.js`)
   - Primary service for code execution
   - Handles interactive input detection
   - Formats results for the playground UI
   - **Endpoint**: `https://ce.judge0.com`

### 2. **AlternativeExecutionService** (`src/services/alternativeExecutionService.js`)
   - Fallback service if primary Judge0 fails
   - Tries multiple Judge0 endpoints:
     - `https://ce.judge0.com`
     - `https://judge0-ce.p.rapidapi.com`
   - Automatic retry with different endpoints

### 3. **ExecutionService** (`src/services/executionService.js`)
   - Main orchestrator service
   - Manages execution flow
   - Handles sequential inputs
   - Filters duplicate prompts
   - Tries primary service first, falls back to alternative if needed

---

## Execution Flow

```
User clicks "Run Code"
    ↓
ExecutionService.executeCode()
    ↓
Detect if code needs input
    ↓
Judge0Service.executeCodeInteractive()
    ↓
POST to https://ce.judge0.com/submissions
    ↓
Judge0 compiles & executes code
    ↓
Returns result (stdout, stderr, status)
    ↓
Format result for display
    ↓
Show output in terminal
```

---

## Supported Languages

Judge0 supports many languages. The playground maps language names to Judge0 language IDs:

- **Python** (language_id: 71)
- **C** (language_id: 50)
- **C++** (language_id: 54)
- **Java** (language_id: 62)
- **JavaScript** (language_id: 63)
- **Go** (language_id: 60)
- **PHP** (language_id: 68)
- **Ruby** (language_id: 72)
- And many more...

Language mappings are defined in `src/utils/languageMap.js`

---

## Features

### ✅ **What Judge0 Provides**:
- Code compilation (for compiled languages)
- Code execution in sandboxed environment
- Input/output handling
- Time and memory limits
- Error detection (compile-time and runtime)
- Support for multiple programming languages

### ✅ **What the Playground Adds**:
- Interactive input handling (simulates terminal input)
- Sequential input support (multiple prompts)
- Duplicate prompt filtering
- Result formatting and display
- Error message formatting
- Input history navigation

---

## API Request Example

```javascript
POST https://ce.judge0.com/submissions?base64_encoded=false&wait=true

Headers:
  Content-Type: application/json

Body:
{
  "source_code": "#include <stdio.h>\nint main() { printf(\"Hello\"); return 0; }",
  "language_id": 50,  // C language
  "stdin": "",
  "base64_encoded": false
}
```

---

## Limitations

### Judge0 API Limitations:
1. **No True Interactive Execution**: Judge0 doesn't support true interactive execution. Each submission is independent, so the playground simulates interactivity by running the program multiple times with accumulated inputs.

2. **Rate Limits**: The free Judge0 API has rate limits. If you hit them, the alternative service tries other endpoints.

3. **Execution Time Limits**: Programs that run too long may timeout.

4. **Memory Limits**: Programs using too much memory may be killed.

5. **Network Dependency**: Requires internet connection to Judge0 API.

---

## Error Handling

The playground handles various error scenarios:

1. **Primary Service Failure**: Automatically tries alternative endpoints
2. **Compilation Errors**: Displays compile errors clearly
3. **Runtime Errors**: Shows runtime error messages
4. **EOF Errors**: Detects when program is waiting for input (not a real error)
5. **Network Errors**: Shows connection error messages

---

## Configuration

### Current Configuration:
- **Primary API**: `https://ce.judge0.com` (free public endpoint)
- **Wait Mode**: `wait=true` (synchronous execution - waits for result)
- **Base64 Encoding**: `false` (sends code as plain text)

### To Use Your Own Judge0 Instance:
1. Deploy Judge0 (self-hosted or cloud)
2. Update `JUDGE0_API_URL` in `src/services/judge0Service.js`
3. Optionally add authentication headers if required

---

## Summary

- **Compilation/Execution**: Judge0 API (`https://ce.judge0.com`)
- **Service Type**: Online REST API
- **Languages**: 50+ programming languages supported
- **Fallback**: Alternative endpoints if primary fails
- **Features**: Compilation, execution, error handling, input/output

The playground acts as a frontend that communicates with Judge0 API to compile and execute your code in a sandboxed environment.

