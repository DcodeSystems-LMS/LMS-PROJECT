// Enhanced execution service for interactive code playground
import judge0Service from './judge0Service';
import alternativeExecutionService from './alternativeExecutionService';
import pistonService from './pistonService';
import { getLanguageId } from '../utils/languageMap';

console.log('✅ ExecutionService loaded - PistonService available:', !!pistonService);

class ExecutionService {
  constructor() {
    this.isExecuting = false;
    this.currentExecution = null;
    this.promptOutput = null; // Store prompt output from first run
    this.accumulatedOutput = ''; // Store all output seen so far for incremental extraction
    this.accumulatedInputs = []; // Store all inputs provided so far
    this.shownPrompts = []; // Track all prompts that have been shown to user
  }

  /**
   * Execute code with interactive input support
   * @param {string} sourceCode - The code to execute
   * @param {string} language - Selected language name
   * @param {string} input - User input (if any)
   * @param {boolean} isFirstRun - Whether this is the first execution
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(sourceCode, language, input = '', isFirstRun = true) {
    if (this.isExecuting) {
      throw new Error('Another execution is already in progress');
    }

    this.isExecuting = true;
    this.currentExecution = {
      sourceCode,
      language,
      input,
      isFirstRun
    };

    try {
      const languageId = getLanguageId(language);
      console.log('ExecutionService - Language:', language, 'Language ID:', languageId, 'Input:', input, 'isFirstRun:', isFirstRun);
      
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }
      
      // Check if code needs input
      const needsInput = this.detectInputRequirements(sourceCode, language);
      
      if (needsInput && isFirstRun) {
        // For programs that need input, run them first to show the input prompt
        console.log('Program needs input, running to show prompt');
        
        // Reset accumulated data for new execution
        this.accumulatedOutput = '';
        this.accumulatedInputs = [];
        this.shownPrompts = [];
        
        let result;
        try {
          // Try Piston first (faster, no rate limits if self-hosted)
          console.log('Trying Piston API for:', language);
          result = await pistonService.executeCode(sourceCode, language, '');
          console.log('Piston API succeeded:', result);
          // Piston doesn't have interactive mode, so we need to check if it needs input
          if (result.needsInput || (result.output && this.isWaitingForInput(result.output, language))) {
            result.needsInput = true;
          }
        } catch (error) {
          console.error('Piston service failed:', error.message);
          console.log('Falling back to Judge0...');
          try {
            result = await judge0Service.executeCodeInteractive(sourceCode, languageId, '', true);
          } catch (error2) {
            console.log('Primary Judge0 service failed, trying alternative...');
            result = await alternativeExecutionService.executeCode(sourceCode, languageId, '');
          }
        }
        
        // Extract only the first prompt (before first input)
        const fullOutput = result.output || '';
        console.log('🔍 Full output from first run:', JSON.stringify(fullOutput));
        console.log('🔍 Result object:', {
          success: result.success,
          output: result.output,
          error: result.error,
          needsInput: result.needsInput
        });
        
        // For programs with multiple prompts, we need to extract only the FIRST one
        // The output might be: "How many numbers do you want to add? Enter 32767 numbers:"
        // We want: "How many numbers do you want to add? "
        
        // First, try to find prompts with question marks (they're usually first)
        // Pattern should match: "How many numbers do you want to add? " (with optional space)
        const questionMarkPattern = /([^?]*\?)\s*/;
        const questionMatch = fullOutput.match(questionMarkPattern);
        if (questionMatch) {
          let firstPrompt = questionMatch[1].trim();
          // Add the question mark back if it was trimmed
          if (!firstPrompt.endsWith('?')) {
            firstPrompt = firstPrompt + '?';
          }
          
          console.log('Found prompt with ?:', firstPrompt);
          
          // Don't check looksLikePrompt too strictly - if it has a question mark and looks like a question, it's a prompt
          const isQuestionPrompt = firstPrompt.toLowerCase().includes('how') || 
                                   firstPrompt.toLowerCase().includes('what') ||
                                   firstPrompt.toLowerCase().includes('enter') ||
                                   firstPrompt.toLowerCase().includes('input') ||
                                   firstPrompt.toLowerCase().includes('type') ||
                                   firstPrompt.toLowerCase().includes('want') ||
                                   firstPrompt.toLowerCase().includes('number');
          
          if (isQuestionPrompt && !this.looksLikeResult(firstPrompt)) {
            console.log('✅ Extracted first prompt (with ?):', firstPrompt);
            this.accumulatedOutput = fullOutput;
            this.promptOutput = firstPrompt;
            this.shownPrompts.push(firstPrompt);
            
            // Check if the result shows it's waiting for input or has an EOFError
            if (result.error && (result.error.includes('EOFError') || result.error.includes('EOF') || result.error.includes('End of file'))) {
              return {
                success: true,
                output: firstPrompt, // Don't use generic message, use actual prompt
                error: '',
                needsInput: true,
                isComplete: false,
                executionId: this.generateExecutionId(),
                promptOutput: firstPrompt
              };
            } else {
              return {
                success: true,
                output: firstPrompt,
                error: '',
                needsInput: true,
                isComplete: false,
                executionId: this.generateExecutionId(),
                promptOutput: firstPrompt
              };
            }
          }
        }
        
        // Also try to find any prompt pattern at the start
        // Check if output starts with a prompt-like text
        const promptStartPattern = /^(How\s+many[^:?]*[?:]|Enter\s+[^:]+:|Input\s+[^:]+:|Type\s+[^:]+:)/i;
        const startMatch = fullOutput.match(promptStartPattern);
        if (startMatch) {
          let firstPrompt = startMatch[1].trim();
          console.log('✅ Extracted first prompt (from start):', firstPrompt);
          this.accumulatedOutput = fullOutput;
          this.promptOutput = firstPrompt;
          this.shownPrompts.push(firstPrompt);
          
          return {
            success: true,
            output: firstPrompt,
            error: '',
            needsInput: true,
            isComplete: false,
            executionId: this.generateExecutionId(),
            promptOutput: firstPrompt
          };
        }
        
        // Fallback to extractFirstPrompt method
        const firstPrompt = this.extractFirstPrompt(fullOutput, language);
        console.log('🔍 Extracted first prompt (fallback):', firstPrompt);
        console.log('🔍 Full output length:', fullOutput.length);
        console.log('🔍 First 200 chars of output:', fullOutput.substring(0, 200));
        
        // If no prompt extracted but we have output, use the first line or first part
        let finalPrompt = firstPrompt;
        if (!finalPrompt && fullOutput) {
          // Try to get first line or first 100 characters
          const firstLine = fullOutput.split('\n')[0] || fullOutput.substring(0, 100);
          if (firstLine.trim()) {
            finalPrompt = firstLine.trim();
            console.log('🔍 Using first line as prompt:', finalPrompt);
          }
        }
        
        // If still no prompt but we know it needs input, try to extract from full output
        if (!finalPrompt && result.needsInput) {
          // Try to get any prompt-like text from full output
          const lines = fullOutput.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && (this.looksLikePrompt(trimmed, language) || trimmed.includes(':'))) {
              finalPrompt = trimmed;
              console.log('🔍 Found prompt from output:', finalPrompt);
              break;
            }
          }
          // Don't use generic message - return empty if no prompt found
          if (!finalPrompt) {
            console.warn('⚠️ No prompt found, returning empty output');
            finalPrompt = '';
          }
        }
        
        // Store accumulated output and track shown prompt
        this.accumulatedOutput = fullOutput;
        this.promptOutput = finalPrompt.trim();
        if (finalPrompt.trim()) {
          this.shownPrompts.push(finalPrompt.trim());
        }
        
        // Check if the result shows it's waiting for input or has an EOFError
        if (result.error && (result.error.includes('EOFError') || result.error.includes('EOF') || result.error.includes('End of file'))) {
          return {
            success: true,
            output: finalPrompt, // Don't use generic message
            error: '',
            needsInput: true,
            isComplete: false,
            executionId: this.generateExecutionId(),
            promptOutput: finalPrompt
          };
        } else if (finalPrompt) {
          // If there's output but no error, show the output and wait for input
          return {
            success: true,
            output: finalPrompt,
            error: '',
            needsInput: true,
            isComplete: false,
            executionId: this.generateExecutionId(),
            promptOutput: finalPrompt
          };
        } else {
          // No output but might still need input (empty prompt)
          return {
            success: result.success,
            output: finalPrompt, // Don't use generic message
            error: result.error,
            needsInput: true,
            isComplete: false,
            executionId: this.generateExecutionId(),
            promptOutput: finalPrompt
          };
        }
      } else if (needsInput && !isFirstRun && input) {
        // Execute with accumulated inputs + new input
        this.accumulatedInputs.push(input);
        const allInputs = this.accumulatedInputs.join('\n');
        
        console.log('Executing with accumulated inputs:', this.accumulatedInputs, 'New input:', input);
        
        let result;
        try {
          // Try Piston first
          console.log('Trying Piston API for:', language);
          result = await pistonService.executeCode(sourceCode, language, allInputs);
          console.log('Piston API succeeded:', result);
          // Check if still needs input
          if (result.needsInput || (result.output && this.detectMoreInputsNeeded(result.output, language))) {
            result.needsInput = true;
          }
        } catch (error) {
          console.error('Piston service failed:', error.message);
          console.log('Falling back to Judge0...');
          try {
            result = await judge0Service.executeCodeInteractive(sourceCode, languageId, allInputs, true);
          } catch (error2) {
            console.log('Primary Judge0 service failed, trying alternative...');
            result = await alternativeExecutionService.executeCode(sourceCode, languageId, allInputs);
          }
        }
        
        // Extract only the NEW output that we haven't shown yet
        const fullOutput = result.output || '';
        const newOutput = this.extractNewOutput(this.accumulatedOutput, fullOutput);
        
        // Update accumulated output
        this.accumulatedOutput = fullOutput;
        
        // Extract the next prompt if program still needs input
        let nextPrompt = '';
        let stillNeedsInput = false;
        let intermediateOutput = ''; // Store intermediate printf statements like "Enter 10 numbers:"
        
        if (result.error && (result.error.includes('EOFError') || result.error.includes('EOF') || result.error.includes('End of file'))) {
          // Still waiting for more input - extract next prompt from new output
          stillNeedsInput = true;
          
          // Extract intermediate output (like "Enter 10 numbers:") before the next prompt
          const lines = newOutput.split('\n');
          const promptLineIndex = lines.findIndex(line => {
            const trimmed = line.trim();
            return this.looksLikePrompt(trimmed, language) && 
                   !this.shownPrompts.some(shown => 
                     trimmed.toLowerCase() === shown.toLowerCase() ||
                     shown.toLowerCase().includes(trimmed.toLowerCase()) ||
                     trimmed.toLowerCase().includes(shown.toLowerCase())
                   );
          });
          
          if (promptLineIndex > 0) {
            // There's output before the prompt (like "Enter 10 numbers:")
            intermediateOutput = lines.slice(0, promptLineIndex).join('\n').trim();
          }
          
          nextPrompt = this.extractNextPrompt(newOutput, language);
          this.promptOutput = nextPrompt.trim();
          if (nextPrompt.trim() && !this.shownPrompts.includes(nextPrompt.trim())) {
            this.shownPrompts.push(nextPrompt.trim());
          }
        } else {
          // Check if output suggests more input is needed
          const hasMorePrompts = this.detectMoreInputsNeeded(newOutput, language);
          if (hasMorePrompts) {
            stillNeedsInput = true;
            
            // Extract intermediate output before the next prompt
            const lines = newOutput.split('\n');
            const promptLineIndex = lines.findIndex(line => {
              const trimmed = line.trim();
              return this.looksLikePrompt(trimmed, language) && 
                     !this.shownPrompts.some(shown => 
                       trimmed.toLowerCase() === shown.toLowerCase() ||
                       shown.toLowerCase().includes(trimmed.toLowerCase()) ||
                       trimmed.toLowerCase().includes(shown.toLowerCase())
                     );
            });
            
            if (promptLineIndex > 0) {
              intermediateOutput = lines.slice(0, promptLineIndex).join('\n').trim();
            }
            
            nextPrompt = this.extractNextPrompt(newOutput, language);
            this.promptOutput = nextPrompt.trim();
            if (nextPrompt.trim() && !this.shownPrompts.includes(nextPrompt.trim())) {
              this.shownPrompts.push(nextPrompt.trim());
            }
          }
        }
        
        // If still needs input, return intermediate output + next prompt
        // Otherwise return the new output (result)
        if (stillNeedsInput && nextPrompt) {
          // Combine intermediate output and next prompt
          const combinedOutput = intermediateOutput 
            ? (intermediateOutput + '\n' + nextPrompt).trim()
            : nextPrompt;
          
          return {
            success: result.success,
            output: combinedOutput,
            error: '',
            needsInput: true,
            isComplete: false,
            executionId: this.generateExecutionId()
          };
        } else {
          // Program completed - return the new output (filtered)
          this.promptOutput = null;
          this.accumulatedOutput = '';
          this.accumulatedInputs = [];
          this.shownPrompts = [];
          
          return {
            success: result.success,
            output: newOutput,
            error: result.error,
            needsInput: false,
            isComplete: true,
            executionId: this.generateExecutionId()
          };
        }
      } else {
        // Execute normally (no input needed or input provided but not first run)
        console.log('Executing normally');
        let result;
        try {
          // Try Piston first
          console.log('Trying Piston API for:', language);
          result = await pistonService.executeCode(sourceCode, language, input);
          console.log('Piston API succeeded:', result);
        } catch (error) {
          console.error('Piston service failed:', error.message);
          console.log('Falling back to Judge0...');
          try {
            result = await judge0Service.executeCodeInteractive(sourceCode, languageId, input, true);
          } catch (error2) {
            console.log('Primary Judge0 service failed, trying alternative...');
            result = await alternativeExecutionService.executeCode(sourceCode, languageId, input);
          }
        }
        
        // Clear stored prompt
        this.promptOutput = null;
        this.shownPrompts = [];
        
        return {
          success: result.success,
          output: result.output,
          error: result.error,
          needsInput: false,
          isComplete: true,
          executionId: this.generateExecutionId()
        };
      }
    } catch (error) {
      // Clear stored prompt on error
      this.promptOutput = null;
      this.shownPrompts = [];
      return {
        success: false,
        output: '',
        error: error.message,
        needsInput: false,
        isComplete: true,
        executionId: this.generateExecutionId()
      };
    } finally {
      this.isExecuting = false;
      this.currentExecution = null;
    }
  }

  /**
   * Extract the first prompt from output (before any input)
   * @param {string} output - Full output from program
   * @param {string} language - Language name
   * @returns {string} First prompt text
   */
  extractFirstPrompt(output, language) {
    if (!output) return '';
    
    // For programs that print multiple prompts at once, extract only the first one
    // Common patterns: "Enter first number: Enter second number: ..."
    // We want to show only "Enter first number: "
    
    const lines = output.split('\n');
    const firstLine = lines[0] || '';
    
    // Special handling for C programs that might have scanf reading garbage
    // Pattern: "How many numbers do you want to add? Enter 32767 numbers:"
    // We want to stop at the first question mark or first prompt
    
    // First, try to find the first question mark (common in prompts)
    const questionMarkIndex = firstLine.indexOf('?');
    if (questionMarkIndex !== -1) {
      const beforeQuestion = firstLine.substring(0, questionMarkIndex + 1).trim();
      // Check if this looks like a prompt
      if (this.looksLikePrompt(beforeQuestion, language) && !this.looksLikeResult(beforeQuestion)) {
        return beforeQuestion;
      }
    }
    
    // Look for patterns like "Enter X: Enter Y:" and extract only the first one
    const promptPatterns = [
      /(How\s+many[^:?]+[?:])/gi,  // "How many...?" or "How many...:"
      /(Enter\s+[^:]+:)/gi,
      /(Input\s+[^:]+:)/gi,
      /(Type\s+[^:]+:)/gi,
      /(Please\s+enter[^:]+:)/gi,
      /([^:]+:\s*)/g  // Any text ending with colon
    ];
    
    for (const pattern of promptPatterns) {
      const matches = Array.from(firstLine.matchAll(pattern));
      if (matches && matches.length > 0) {
        // Return only the first prompt match
        const firstMatch = matches[0];
        const matchText = firstMatch[0];
        const matchIndex = firstMatch.index;
        
        // Extract from start to end of first match
        let extracted = firstLine.substring(0, matchIndex + matchText.length);
        
        // Trim any trailing spaces but keep the colon/question mark
        extracted = extracted.trim();
        
        // Verify this looks like a prompt (not a result)
        if (this.looksLikePrompt(extracted, language) && !this.looksLikeResult(extracted)) {
          // Additional check: if the extracted text contains patterns like "Enter [number] numbers:",
          // it means scanf read garbage and we should stop before that
          const garbagePattern = /Enter\s+\d+\s+numbers?:/i;
          if (garbagePattern.test(extracted)) {
            // Find where the garbage pattern starts and stop before it
            const garbageMatch = extracted.match(garbagePattern);
            if (garbageMatch && garbageMatch.index !== undefined) {
              extracted = extracted.substring(0, garbageMatch.index).trim();
              // If we have a question mark or colon before the garbage, keep it
              if (extracted.endsWith('?') || extracted.endsWith(':')) {
                return extracted;
              }
            }
          }
          
          return extracted;
        }
      }
    }
    
    // If no pattern match, try to find first colon and extract up to it
    const colonIndex = firstLine.indexOf(':');
    if (colonIndex !== -1) {
      const beforeColon = firstLine.substring(0, colonIndex + 1).trim();
      const afterColon = firstLine.substring(colonIndex + 1).trim();
      
      // Check if after colon contains garbage patterns (like "Enter 32767 numbers:")
      const garbagePattern = /Enter\s+\d+\s+numbers?:/i;
      if (garbagePattern.test(afterColon)) {
        // Stop at the first colon (before garbage)
        return beforeColon;
      }
      
      // If text after colon looks like another prompt or result, stop at first colon
      if (afterColon && (this.looksLikePrompt(afterColon, language) || this.looksLikeResult(afterColon))) {
        return beforeColon;
      }
    }
    
    // Fallback: return first line if it's short (likely a single prompt)
    // But check for garbage patterns first
    const garbagePattern = /Enter\s+\d+\s+numbers?:/i;
    if (garbagePattern.test(firstLine)) {
      // Extract only up to the garbage pattern
      const garbageMatch = firstLine.match(garbagePattern);
      if (garbageMatch && garbageMatch.index !== undefined) {
        const beforeGarbage = firstLine.substring(0, garbageMatch.index).trim();
        if (beforeGarbage.endsWith('?') || beforeGarbage.endsWith(':')) {
          return beforeGarbage;
        }
      }
    }
    
    if (firstLine.length < 100 && !this.looksLikeResult(firstLine)) {
      return firstLine.trim();
    }
    
    // Otherwise, return empty (will be handled by caller)
    return '';
  }

  /**
   * Check if text looks like a result (not a prompt)
   * @param {string} text - Text to check
   * @returns {boolean} Whether text looks like a result
   */
  looksLikeResult(text) {
    const resultKeywords = [
      'sum is', 'result is', 'answer is', 'output is', 'value is', 'total is',
      'sum =', 'result =', 'answer =', 'output =', 'value =', 'total =',
      'sum:', 'result:', 'answer:', 'output:', 'value:', 'total:',
      'total sum'  // "Total Sum = 30"
    ];
    // Check for result keywords
    if (resultKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
      return true;
    }
    // Check for patterns like "Sum = 30", "Result: 42", "Total Sum = 30", etc.
    const resultPattern = /^(total\s+)?(sum|result|answer|output|value|total)\s*[=:]\s*\d+/i;
    if (resultPattern.test(text)) {
      return true;
    }
    return false;
  }

  /**
   * Check if text looks like a prompt
   * @param {string} text - Text to check
   * @param {string} language - Language name
   * @returns {boolean} Whether text looks like a prompt
   */
  looksLikePrompt(text, language) {
    if (!text || !text.trim()) return false;
    
    const textLower = text.toLowerCase();
    const promptKeywords = [
      'Enter', 'Input', 'Type', 'Please', 'enter', 'input', 'type', 'Number',
      'How many', 'How much', 'How', 'What', 'Which', 'Where', 'When', 'Who',
      'how many', 'how much', 'how', 'what', 'which', 'where', 'when', 'who',
      'number', 'numbers', 'value', 'values', 'name', 'age', 'count', 'want'
    ];
    
    // Check for "Number X:" pattern
    if (/Number\s+\d+:\s*$/i.test(text.trim())) {
      return true;
    }
    
    // Check if it contains prompt keywords
    const hasKeyword = promptKeywords.some(keyword => textLower.includes(keyword));
    
    // Check if it ends with ? or : (common prompt endings)
    const hasPromptEnding = text.trim().endsWith('?') || text.trim().endsWith(':');
    
    // Check if it's a question (contains "how", "what", etc. with "?")
    const isQuestion = textLower.includes('?') && (
      textLower.includes('how') || 
      textLower.includes('what') || 
      textLower.includes('which') ||
      textLower.includes('enter') ||
      textLower.includes('input') ||
      textLower.includes('want')
    );
    
    return hasKeyword || hasPromptEnding || isQuestion;
  }

  /**
   * Extract new output that hasn't been shown yet
   * @param {string} previousOutput - Output we've already shown
   * @param {string} currentOutput - Current full output
   * @returns {string} New output to show
   */
  extractNewOutput(previousOutput, currentOutput) {
    if (!previousOutput) {
      return currentOutput;
    }
    
    let newOutput = currentOutput;
    
    // Step 1: Remove all previously shown prompts using regex patterns
    // This handles cases where prompts are concatenated without newlines
    const promptPatterns = [
      /Number\s+\d+:\s*/gi,  // "Number 1:", "Number 2:", etc.
      /Enter\s+first\s+number:\s*/gi,
      /Enter\s+second\s+number:\s*/gi,
      /Enter\s+third\s+number:\s*/gi,
      /Enter\s+[^:\n]+:\s*/gi,  // Generic "Enter X:" pattern
      /Input\s+[^:\n]+:\s*/gi,
      /Type\s+[^:\n]+:\s*/gi,
      /Please\s+enter[^:\n]+:\s*/gi,
    ];
    
    // Remove prompts that have already been shown
    for (const shownPrompt of this.shownPrompts) {
      // Escape special regex characters in the shown prompt
      const escapedPrompt = this.escapeRegex(shownPrompt);
      // Create a pattern that matches the prompt with optional whitespace
      const promptPattern = new RegExp(`\\s*${escapedPrompt}\\s*`, 'gi');
      newOutput = newOutput.replace(promptPattern, '');
    }
    
    // Also remove generic prompt patterns that match shown prompts
    for (const pattern of promptPatterns) {
      const matches = newOutput.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Check if this prompt was already shown
          const normalizedMatch = match.trim();
          if (this.shownPrompts.some(shown => 
            normalizedMatch.toLowerCase() === shown.toLowerCase() ||
            shown.toLowerCase().includes(normalizedMatch.toLowerCase()) ||
            normalizedMatch.toLowerCase().includes(shown.toLowerCase())
          )) {
            // Remove this duplicate prompt
            const escapedMatch = this.escapeRegex(match);
            const matchPattern = new RegExp(`\\s*${escapedMatch}\\s*`, 'gi');
            newOutput = newOutput.replace(matchPattern, '');
          }
        }
      }
    }
    
    // Step 2: Try to find where previous output ends in current output
    if (currentOutput.startsWith(previousOutput)) {
      const candidate = currentOutput.substring(previousOutput.length).trim();
      // Only use this if it doesn't contain duplicate prompts
      if (!this.containsDuplicatePrompts(candidate)) {
        newOutput = candidate;
      }
    } else {
      // Previous output might be embedded - try to remove it
      const candidate = currentOutput.replace(previousOutput, '').trim();
      if (!this.containsDuplicatePrompts(candidate)) {
        newOutput = candidate;
      }
    }
    
    // Step 3: Remove input values that appear as standalone lines
    // But preserve them if they're part of a result (e.g., "Sum = 30")
    if (this.accumulatedInputs.length > 0) {
      for (const input of this.accumulatedInputs) {
        // Only remove input if it's on its own line, not part of a result
        const inputPattern = new RegExp(`^\\s*${this.escapeRegex(input)}\\s*$`, 'gm');
        newOutput = newOutput.replace(inputPattern, '');
      }
    }
    
    // Step 4: Ensure result lines and intermediate printf statements are preserved
    const lines = newOutput.split('\n');
    const preservedLines = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      
      // Always preserve lines that look like results
      if (this.looksLikeResult(trimmed)) {
        return true;
      }
      
      // Preserve intermediate printf statements like "Enter 10 numbers:" (not prompts, just output)
      // These are lines that contain "Enter" but don't end with a colon/question and aren't prompts
      if (trimmed.toLowerCase().includes('enter') && 
          !trimmed.endsWith(':') && 
          !trimmed.endsWith('?') &&
          !this.looksLikePrompt(trimmed, '')) {
        return true;
      }
      
      // Preserve non-empty lines that don't look like duplicate prompts
      // Check if this line is a duplicate of a shown prompt
      const isDuplicatePrompt = this.shownPrompts.some(shown => {
        const shownLower = shown.toLowerCase();
        const lineLower = trimmed.toLowerCase();
        return lineLower === shownLower ||
               lineLower.includes(shownLower) ||
               shownLower.includes(lineLower);
      });
      
      return !isDuplicatePrompt;
    });
    
    // Step 5: Clean up extra whitespace and newlines
    newOutput = preservedLines.join('\n');
    newOutput = newOutput.replace(/\n\s*\n\s*\n/g, '\n'); // Multiple newlines to single
    newOutput = newOutput.replace(/^\s+|\s+$/gm, ''); // Trim each line
    
    return newOutput.trim();
  }
  
  /**
   * Check if output contains prompts that have already been shown
   * @param {string} output - Output to check
   * @returns {boolean} Whether output contains duplicate prompts
   */
  containsDuplicatePrompts(output) {
    if (!output || this.shownPrompts.length === 0) return false;
    
    const promptPatterns = [
      /Number\s+\d+:\s*/gi,  // "Number 1:", "Number 2:", etc.
      /Enter\s+[^:\n]+:\s*/gi,
      /Input\s+[^:\n]+:\s*/gi,
      /Type\s+[^:\n]+:\s*/gi,
    ];
    
    for (const pattern of promptPatterns) {
      const matches = output.match(pattern);
      if (matches) {
        for (const match of matches) {
          const normalizedMatch = match.trim();
          if (this.shownPrompts.some(shown => 
            normalizedMatch.toLowerCase() === shown.toLowerCase() ||
            shown.toLowerCase().includes(normalizedMatch.toLowerCase()) ||
            normalizedMatch.toLowerCase().includes(shown.toLowerCase())
          )) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Extract the next prompt from output (for sequential inputs)
   * @param {string} output - Current output
   * @param {string} language - Language name
   * @returns {string} Next prompt text
   */
  extractNextPrompt(output, language) {
    if (!output) return '';
    
    // Look for prompt patterns in the output
    // Include patterns for "Number X:" which is common in loops
    const promptPatterns = [
      /(Number\s+\d+:\s*)/gi,  // "Number 1:", "Number 2:", etc.
      /(Enter\s+\w+[^:\n]*:)/gi,
      /(Input\s+\w+[^:\n]*:)/gi,
      /(Type\s+\w+[^:\n]*:)/gi,
      /(Please\s+enter[^:\n]*:)/gi,
      /([^:\n]+:\s*$)/gm  // Any text ending with colon
    ];
    
    // First, try to find prompts by scanning through the output line by line
    // This ensures we get the FIRST new prompt, not the last
    const lines = output.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      
      for (const pattern of promptPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          for (const match of matches) {
            const normalized = match.trim();
            // Check if this prompt was already shown
            const isDuplicate = this.shownPrompts.some(shown => 
              normalized.toLowerCase() === shown.toLowerCase() ||
              shown.toLowerCase().includes(normalized.toLowerCase()) ||
              normalized.toLowerCase().includes(shown.toLowerCase())
            );
            
            if (!isDuplicate && this.looksLikePrompt(normalized, language) && !this.looksLikeResult(normalized)) {
              return normalized;
            }
          }
        }
      }
      
      // Also check if the line itself ends with ':' and looks like a prompt
      if (line.trim().endsWith(':') || line.trim().endsWith('?')) {
        const normalized = line.trim();
        const isDuplicate = this.shownPrompts.some(shown => 
          normalized.toLowerCase() === shown.toLowerCase() ||
          shown.toLowerCase().includes(normalized.toLowerCase()) ||
          normalized.toLowerCase().includes(shown.toLowerCase())
        );
        
        if (!isDuplicate && this.looksLikePrompt(normalized, language) && !this.looksLikeResult(normalized)) {
          return normalized;
        }
      }
    }
    
    // Fallback: collect all matches and return the first new one
    const allMatches = [];
    for (const pattern of promptPatterns) {
      const matches = output.match(pattern);
      if (matches) {
        allMatches.push(...matches);
      }
    }
    
    if (allMatches.length > 0) {
      // Filter out prompts that have already been shown
      const newPrompts = allMatches.filter(match => {
        const normalized = match.trim();
        return !this.shownPrompts.some(shown => 
          normalized.toLowerCase() === shown.toLowerCase() ||
          shown.toLowerCase().includes(normalized.toLowerCase()) ||
          normalized.toLowerCase().includes(shown.toLowerCase())
        );
      });
      
      // Return the first new prompt found
      if (newPrompts.length > 0) {
        return newPrompts[0].trim();
      }
    }
    
    return '';
  }

  /**
   * Detect if more inputs are needed based on output
   * @param {string} output - Current output
   * @param {string} language - Language name
   * @returns {boolean} Whether more inputs are needed
   */
  detectMoreInputsNeeded(output, language) {
    if (!output) return false;
    
    // Check for prompt patterns
    const promptPatterns = [
      /Number\s+\d+:/i,  // "Number 1:", "Number 2:", etc.
      /Enter\s+\w+/i,
      /Input\s+\w+/i,
      /Type\s+\w+/i,
      /Please\s+enter/i,
      /:\s*$/m  // Line ending with colon
    ];
    
    const hasPrompt = promptPatterns.some(pattern => pattern.test(output));
    
    if (!hasPrompt) return false;
    
    // Check if the prompt is a new one (not already shown)
    // Extract prompts and check if any are new
    const extractedPrompts = this.extractNextPrompt(output, language);
    return extractedPrompts.length > 0;
  }

  /**
   * Escape special regex characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Detect if code requires input
   * @param {string} sourceCode - The source code
   * @param {string} language - Language name
   * @returns {boolean} Whether input is required
   */
  detectInputRequirements(sourceCode, language) {
    const inputPatterns = {
      'Python': [
        'input(', 'raw_input(',
        'sys.stdin', 'input()'
      ],
      'C': [
        'scanf(', 'gets(', 'fgets(',
        'getchar(', 'fgetc('
      ],
      'C++': [
        'cin >>', 'getline(', 'cin.get(',
        'cin.getline(', 'cin.read('
      ],
      'Java': [
        'Scanner', 'nextLine(', 'nextInt(',
        'nextDouble(', 'nextFloat(', 'next()',
        'System.in', 'BufferedReader'
      ],
      'JavaScript': [
        'readline', 'prompt(', 'process.stdin',
        'require(\'readline\')'
      ],
      'Go': [
        'fmt.Scan', 'fmt.Scanln', 'fmt.Scanf',
        'bufio.Reader', 'bufio.Scanner', 'fmt.Print'
      ],
      'PHP': [
        'fgets(', 'readline(', 'fscanf(',
        'fgetc(', 'stream_get_line('
      ],
      'Ruby': [
        'gets', 'gets.chomp', 'STDIN.gets',
        'ARGF.gets'
      ]
    };

    const patterns = inputPatterns[language] || [];
    return patterns.some(pattern => sourceCode.includes(pattern));
  }

  /**
   * Check if output suggests waiting for input
   * @param {string} output - Program output
   * @param {string} language - Language name
   * @returns {boolean} Whether waiting for input
   */
  isWaitingForInput(output, language) {
    const inputIndicators = [
      'Enter', 'Input', 'Type', 'Please',
      ':', '?', '>>>', '>>', '$',
      'calculate', 'factorial', 'number',
      'enter your name', 'enter name', 'name:',
      'input:', 'please enter', 'type your'
    ];

    // Check if output contains input prompts
    const hasPrompt = inputIndicators.some(indicator => 
      output.toLowerCase().includes(indicator.toLowerCase())
    );

    // For Go specifically, check for common patterns
    if (language === 'Go') {
      const goPatterns = [
        'Enter a number', 'Enter', 'Input', 'Type',
        'calculate', 'factorial', 'number'
      ];
      const hasGoPrompt = goPatterns.some(pattern => 
        output.toLowerCase().includes(pattern.toLowerCase())
      );
      if (hasGoPrompt) return true;
    }

    // For Python, check for common input patterns
    if (language === 'Python') {
      const pythonPatterns = [
        'enter your name', 'enter name', 'name:',
        'input:', 'please enter', 'type your'
      ];
      const hasPythonPrompt = pythonPatterns.some(pattern => 
        output.toLowerCase().includes(pattern.toLowerCase())
      );
      if (hasPythonPrompt) return true;
    }

    // For some languages, empty output might mean waiting for input
    const isEmptyOutput = !output.trim();
    
    return hasPrompt || (isEmptyOutput && this.detectInputRequirements(output, language));
  }

  /**
   * Generate unique execution ID
   * @returns {string} Execution ID
   */
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Stop current execution
   */
  stopExecution() {
    this.isExecuting = false;
    this.currentExecution = null;
    this.promptOutput = null; // Clear stored prompt
    this.accumulatedOutput = ''; // Clear accumulated output
    this.accumulatedInputs = []; // Clear accumulated inputs
    this.shownPrompts = []; // Clear shown prompts
  }

  /**
   * Reset all execution state (useful when switching languages)
   * This ensures clean state for new language execution
   */
  reset() {
    this.isExecuting = false;
    this.currentExecution = null;
    this.promptOutput = null;
    this.accumulatedOutput = '';
    this.accumulatedInputs = [];
    this.shownPrompts = [];
    console.log('✅ ExecutionService reset - ready for new language');
  }

  /**
   * Get current execution status
   * @returns {Object} Current execution info
   */
  getExecutionStatus() {
    return {
      isExecuting: this.isExecuting,
      currentExecution: this.currentExecution
    };
  }
}

// Create and export singleton instance
const executionService = new ExecutionService();
export default executionService;
