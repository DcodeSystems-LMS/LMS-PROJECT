// Judge0 API service for code execution
const JUDGE0_API_URL = 'https://ce.judge0.com';

class Judge0Service {
  constructor() {
    this.baseUrl = JUDGE0_API_URL;
  }

  /**
   * Execute code using Judge0 API
   * @param {string} sourceCode - The code to execute
   * @param {number} languageId - Judge0 language ID
   * @param {string} input - Optional input for the program
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(sourceCode, languageId, input = '') {
    try {
      // Validate language ID
      if (!languageId || languageId < 1) {
        throw new Error(`Invalid language ID: ${languageId}`);
      }

      // Validate source code
      if (!sourceCode || sourceCode.trim() === '') {
        throw new Error('Source code cannot be empty');
      }

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

      const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Judge0 API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return this.formatResult(result);
    } catch (error) {
      console.error('Judge0 API Error:', error);
      throw new Error(`Failed to execute code: ${error.message}`);
    }
  }

  /**
   * Execute code with interactive input support
   * @param {string} sourceCode - The code to execute
   * @param {number} languageId - Judge0 language ID
   * @param {string} input - Input for the program
   * @param {boolean} isInteractive - Whether this is an interactive execution
   * @returns {Promise<Object>} Execution result
   */
  async executeCodeInteractive(sourceCode, languageId, input = '', isInteractive = false) {
    try {
      // Validate language ID
      if (!languageId || languageId < 1) {
        throw new Error(`Invalid language ID: ${languageId}`);
      }

      // Validate source code
      if (!sourceCode || sourceCode.trim() === '') {
        throw new Error('Source code cannot be empty');
      }

      console.log('Judge0 API Request:', {
        languageId,
        sourceCodeLength: sourceCode.length,
        inputLength: input.length,
        isInteractive
      });

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

      const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Judge0 API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Judge0 API Response:', result);
      return this.formatResult(result, isInteractive);
    } catch (error) {
      console.error('Judge0 API Error:', error);
      throw new Error(`Failed to execute code: ${error.message}`);
    }
  }

  /**
   * Execute code with stdin detection
   * @param {string} sourceCode - The code to execute
   * @param {number} languageId - Judge0 language ID
   * @param {string} input - Input for the program
   * @returns {Promise<Object>} Execution result
   */
  async executeCodeWithStdin(sourceCode, languageId, input = '') {
    try {
      const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageId,
          stdin: input,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return this.formatResult(result, true);
    } catch (error) {
      console.error('Judge0 API Error:', error);
      throw new Error('Failed to execute code. Please try again.');
    }
  }

  /**
   * Format the result from Judge0 API
   * @param {Object} result - Raw result from Judge0
   * @param {boolean} isInteractive - Whether this is an interactive execution
   * @returns {Object} Formatted result
   */
  formatResult(result, isInteractive = false) {
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
      output = isInteractive ? '' : 'Program executed successfully (no output)';
    } else {
      error = 'Unknown error occurred';
    }

    return {
      success: isSuccess && !hasCompileError && !hasRuntimeError,
      output: output.trim(),
      error: error.trim(),
      time: time || '0',
      memory: memory || '0',
      status: status ? status.description : 'Unknown',
      isInteractive: isInteractive,
      needsInput: isInteractive && isSuccess && !hasOutput && !hasCompileError && !hasRuntimeError
    };
  }

  /**
   * Get supported languages from Judge0 API
   * @returns {Promise<Array>} List of supported languages
   */
  async getSupportedLanguages() {
    try {
      const response = await fetch(`${this.baseUrl}/languages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching languages:', error);
      return [];
    }
  }

  /**
   * Check if Judge0 API is available
   * @returns {Promise<boolean>} API availability status
   */
  async checkApiHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/languages`);
      return response.ok;
    } catch (error) {
      console.error('Judge0 API health check failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const judge0Service = new Judge0Service();
export default judge0Service;
