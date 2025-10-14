// Enhanced execution service for interactive code playground
import judge0Service from './judge0Service';
import alternativeExecutionService from './alternativeExecutionService';
import { getLanguageId } from '../utils/languageMap';

class ExecutionService {
  constructor() {
    this.isExecuting = false;
    this.currentExecution = null;
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
      console.log('ExecutionService - Language:', language, 'Language ID:', languageId);
      
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }
      
      // Check if code needs input
      const needsInput = this.detectInputRequirements(sourceCode, language);
      
      if (needsInput && isFirstRun) {
        // For programs that need input, run them first to show the input prompt
        console.log('Program needs input, running to show prompt');
        let result;
        try {
          result = await judge0Service.executeCodeInteractive(sourceCode, languageId, '', true);
        } catch (error) {
          console.log('Primary Judge0 service failed, trying alternative...');
          result = await alternativeExecutionService.executeCode(sourceCode, languageId, '');
        }
        
        // Check if the result shows it's waiting for input or has an EOFError
        if (result.error && (result.error.includes('EOFError') || result.error.includes('EOF'))) {
          return {
            success: true,
            output: result.output || 'Program is waiting for input.',
            error: '',
            needsInput: true,
            isComplete: false,
            executionId: this.generateExecutionId()
          };
        } else if (result.output && result.output.trim()) {
          // If there's output but no error, show the output and wait for input
          return {
            success: true,
            output: result.output,
            error: '',
            needsInput: true,
            isComplete: false,
            executionId: this.generateExecutionId()
          };
        } else {
          return {
            success: result.success,
            output: result.output,
            error: result.error,
            needsInput: false,
            isComplete: true,
            executionId: this.generateExecutionId()
          };
        }
      } else {
        // Execute with provided input
        console.log('Executing with input:', input);
        let result;
        try {
          result = await judge0Service.executeCodeInteractive(sourceCode, languageId, input, true);
        } catch (error) {
          console.log('Primary Judge0 service failed, trying alternative...');
          result = await alternativeExecutionService.executeCode(sourceCode, languageId, input);
        }
        
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
