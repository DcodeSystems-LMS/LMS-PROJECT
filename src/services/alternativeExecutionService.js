// Alternative execution service using different Judge0 endpoints
const JUDGE0_ALTERNATIVE_URLS = [
  'https://ce.judge0.com',
  'https://judge0-ce.p.rapidapi.com',
  'https://judge0-ce.p.rapidapi.com/submissions'
];

class AlternativeExecutionService {
  constructor() {
    this.currentUrlIndex = 0;
  }

  /**
   * Execute code using alternative Judge0 endpoints
   * @param {string} sourceCode - The code to execute
   * @param {number} languageId - Judge0 language ID
   * @param {string} input - Optional input for the program
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(sourceCode, languageId, input = '') {
    const maxRetries = JUDGE0_ALTERNATIVE_URLS.length;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const baseUrl = JUDGE0_ALTERNATIVE_URLS[this.currentUrlIndex];
        console.log(`Attempting execution with ${baseUrl} (attempt ${attempt + 1})`);
        
        const result = await this.tryExecuteWithUrl(baseUrl, sourceCode, languageId, input);
        
        if (result.success || result.error) {
          return result;
        }
        
        // If this attempt failed, try next URL
        this.currentUrlIndex = (this.currentUrlIndex + 1) % JUDGE0_ALTERNATIVE_URLS.length;
        
      } catch (error) {
        console.error(`Execution attempt ${attempt + 1} failed:`, error);
        
        if (attempt === maxRetries - 1) {
          throw new Error(`All execution endpoints failed. Last error: ${error.message}`);
        }
        
        // Try next URL
        this.currentUrlIndex = (this.currentUrlIndex + 1) % JUDGE0_ALTERNATIVE_URLS.length;
      }
    }
    
    throw new Error('All execution endpoints failed');
  }

  /**
   * Try to execute code with a specific URL
   * @param {string} baseUrl - Base URL for the API
   * @param {string} sourceCode - Source code to execute
   * @param {number} languageId - Language ID
   * @param {string} input - Input for the program
   * @returns {Promise<Object>} Execution result
   */
  async tryExecuteWithUrl(baseUrl, sourceCode, languageId, input) {
    const requestBody = {
      source_code: sourceCode,
      language_id: parseInt(languageId),
      stdin: input || '',
      expected_output: null,
      cpu_time_limit: null,
      cpu_extra_time: null,
      wall_time_limit: null,
      memory_limit: null,
      stack_limit: null,
      max_processes_and_or_threads: null,
      enable_per_process_and_thread_time_limit: null,
      enable_per_process_and_thread_memory_limit: null,
      max_file_size: null,
      base64_encoded: false
    };

    const response = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return this.formatResult(result);
  }

  /**
   * Format the result from Judge0 API
   * @param {Object} result - Raw result from Judge0
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    const {
      stdout,
      stderr,
      compile_output,
      message,
      status,
      time,
      memory
    } = result;

    // Determine if execution was successful
    const isSuccess = status && status.id === 3; // Accepted status
    const hasCompileError = compile_output && compile_output.trim() !== '';
    const hasRuntimeError = stderr && stderr.trim() !== '';
    const hasOutput = stdout && stdout.trim() !== '';

    let output = '';
    let error = '';

    if (hasCompileError) {
      error = `Compilation Error:\n${compile_output}`;
    } else if (hasRuntimeError) {
      error = `Runtime Error:\n${stderr}`;
    } else if (message) {
      error = `Error: ${message}`;
    } else if (hasOutput) {
      output = stdout;
    } else if (isSuccess) {
      output = 'Program executed successfully (no output)';
    } else {
      error = 'Unknown error occurred';
    }

    return {
      success: isSuccess && !hasCompileError && !hasRuntimeError,
      output: output.trim(),
      error: error.trim(),
      time: time || '0',
      memory: memory || '0',
      status: status ? status.description : 'Unknown'
    };
  }
}

// Create and export singleton instance
const alternativeExecutionService = new AlternativeExecutionService();
export default alternativeExecutionService;
