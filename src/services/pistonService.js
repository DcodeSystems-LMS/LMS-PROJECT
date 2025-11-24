// Piston API service for code execution
// Piston is an open-source, self-hostable code execution engine
// Public endpoint: https://emkc.org/api/v2/piston
// Self-hosted: http://your-server:2000/api/v2/piston

console.log('✅ PistonService module loaded');

class PistonService {
  constructor() {
    // Use self-hosted Piston endpoint directly
    // Piston v3.1.1 API structure: http://49.204.168.41:2000/api/v2/execute
    // Note: CORS must be configured on Piston server for this to work
    let apiUrl = 'http://49.204.168.41:2000/api/v2'; // Base URL for Piston v3
    
    // Check for environment variable override (if needed)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // Vite environment - check for custom URL
      apiUrl = import.meta.env.VITE_PISTON_API_URL || apiUrl;
    } else if (typeof process !== 'undefined' && process.env) {
      // Node.js/SSR environment - check for custom URL
      apiUrl = process.env.REACT_APP_PISTON_API_URL || apiUrl;
    }
    
    this.baseUrl = apiUrl;
    console.log('✅ PistonService configured with URL:', this.baseUrl);
    
    // Map language names to Piston language identifiers
    // Piston supports many languages - this maps common ones
    this.languageMap = {
      'Python': 'python',
      'JavaScript': 'javascript',
      'Java': 'java',
      'C': 'c',
      'C++': 'cpp',
      'Go': 'go',
      'PHP': 'php',
      'Ruby': 'ruby',
      'Rust': 'rust',
      'Swift': 'swift',
      'Kotlin': 'kotlin',
      'TypeScript': 'typescript',
      'Scala': 'scala',
      'Perl': 'perl',
      'Lua': 'lua',
      'Haskell': 'haskell',
      'Clojure': 'clojure',
      'Erlang': 'erlang',
      'Elixir': 'elixir',
      'Dart': 'dart',
      'R': 'r',
      'Bash': 'bash',
      'PowerShell': 'powershell',
      'C#': 'csharp',
      'F#': 'fsharp',
      'VB.NET': 'vbnet',
      'Objective-C': 'objective-c',
      'Assembly': 'assembly',
      'COBOL': 'cobol',
      'Fortran': 'fortran',
      'Pascal': 'pascal',
      'Prolog': 'prolog',
      'Lisp': 'lisp',
      'Scheme': 'scheme',
      'OCaml': 'ocaml',
      'Julia': 'julia',
      'Nim': 'nim',
      'Crystal': 'crystal',
      'Zig': 'zig',
      'V': 'v',
      'D': 'd',
      'Elm': 'elm',
      'PureScript': 'purescript',
      'CoffeeScript': 'coffeescript',
      'Racket': 'racket',
      'Raku': 'raku'
    };
  }

  /**
   * Execute code using Piston API
   * @param {string} sourceCode - The code to execute
   * @param {string} language - Language name (e.g., "Python", "JavaScript")
   * @param {string} input - Optional input for the program
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(sourceCode, language, input = '') {
    console.log('🚀 PISTON SERVICE CALLED - executeCode()', {
      language,
      sourceCodeLength: sourceCode?.length || 0,
      inputLength: input?.length || 0
    });
    
    try {
      // Validate source code
      if (!sourceCode || sourceCode.trim() === '') {
        throw new Error('Source code cannot be empty');
      }

      // Get Piston language identifier
      // Handle variations like "C Language" -> "C"
      const normalizedLanguage = language.replace(/\s+Language$/, '').trim();
      const pistonLanguage = this.languageMap[normalizedLanguage] || 
                            this.languageMap[language] || 
                            language.toLowerCase();
      
      console.log('📤 Piston API Request:', {
        originalLanguage: language,
        normalizedLanguage: normalizedLanguage,
        pistonLanguage: pistonLanguage,
        sourceCodeLength: sourceCode.length,
        inputLength: input.length,
        baseUrl: this.baseUrl
      });

      if (!pistonLanguage) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // ALWAYS fetch runtimes from server first to get actual installed versions
      // Never use hardcoded versions - they might not match what's installed
      let version = null;
      
      try {
        console.log(`🔍 Fetching runtimes from Piston server for ${pistonLanguage}...`);
        const runtimes = await this.getAvailableRuntimes();
        console.log('📋 Available runtimes from server:', runtimes);
        
        // Check if runtimes array is empty
        if (!runtimes || runtimes.length === 0) {
          throw new Error('No runtimes installed on Piston server. Please install runtimes using: docker exec -it <container> /bin/sh, then cd /app/cli && ./ppman install c');
        }
        
        // Find the language runtime - Piston returns array of {language, version, aliases}
        const languageRuntime = runtimes.find(r => 
          r.language === pistonLanguage || 
          (r.aliases && r.aliases.includes(pistonLanguage))
        );
        
        if (languageRuntime && languageRuntime.version) {
          version = languageRuntime.version;
          console.log(`✅ Found version for ${pistonLanguage} from server: ${version}`);
        } else {
          // Try to find any version of this language
          const anyVersion = runtimes.find(r => r.language === pistonLanguage);
          if (anyVersion && anyVersion.version) {
            version = anyVersion.version;
            console.log(`✅ Using first available version for ${pistonLanguage}: ${version}`);
          } else {
            // Show available languages
            const availableLanguages = [...new Set(runtimes.map(r => r.language))].join(', ');
            throw new Error(`Language '${pistonLanguage}' not found in available runtimes. Available languages: ${availableLanguages || 'none'}. Please install runtimes on the server.`);
          }
        }
      } catch (error) {
        console.error('❌ Could not fetch runtimes:', error.message);
        throw new Error(`Could not determine version for ${pistonLanguage}. ${error.message}`);
      }
      
      // Ensure we have a version (never use '*' or null)
      if (!version || version === '*') {
        console.error(`❌ Invalid version for ${pistonLanguage}: ${version}`);
        throw new Error(`Invalid version for ${pistonLanguage}. Version cannot be '*' or empty. Please check if runtimes are installed on the server.`);
      }

      console.log(`✅ Using version for ${pistonLanguage}: ${version}`);

      const requestBody = {
        language: pistonLanguage,
        version: version, // Use specific version (never '*')
        files: [{
          content: sourceCode
        }],
        stdin: input || '',
        args: [] // Command line arguments (if needed)
      };
      
      console.log('📦 Final request body:', JSON.stringify(requestBody, null, 2));

      // Piston v3.1.1 correct endpoint: /api/v2/execute
      // Base URL: http://49.204.168.41:2000/api/v2
      // Full URL: http://49.204.168.41:2000/api/v2/execute
      const executeUrl = `${this.baseUrl}/execute`;
      console.log('🔗 Piston execute URL:', executeUrl);
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(executeUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Piston API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Piston API Response:', result);
      
      return this.formatResult(result);
    } catch (error) {
      console.error('Piston API Error:', error);
      throw new Error(`Failed to execute code: ${error.message}`);
    }
  }

  /**
   * Format the result from Piston API
   * @param {Object} result - Raw result from Piston
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    const { run } = result;
    
    if (!run) {
      return {
        success: false,
        output: '',
        error: 'Invalid response from Piston API',
        time: '0',
        memory: '0',
        status: 'Error'
      };
    }

    // Piston returns exit code: 0 = success, non-zero = error
    const isSuccess = run.code === 0;
    const hasOutput = run.stdout && run.stdout.trim() !== '';
    const hasError = run.stderr && run.stderr.trim() !== '';

    let output = '';
    let error = '';

    if (hasError) {
      // Check if error is actually an EOFError (waiting for input)
      const stderrLower = run.stderr.toLowerCase();
      const isEOFError = stderrLower.includes('eof') || 
                        stderrLower.includes('end of file') ||
                        stderrLower.includes('eoferror') ||
                        stderrLower.includes('unexpected eof');
      
      if (isEOFError) {
        // This is waiting for input, not a real error
        output = run.stdout || '';
        // Sometimes the prompt might be in stderr or the output might be empty
        // Check if stderr has any prompt-like text before the EOF error
        if (!output && run.stderr) {
          const stderrText = run.stderr;
          // Try to find prompt patterns in stderr
          const promptPatterns = [
            /(How\s+many[^?]*\?)/i,
            /(Enter\s+[^:]+:)/i,
            /(Number\s+\d+:)/i
          ];
          for (const pattern of promptPatterns) {
            const match = stderrText.match(pattern);
            if (match) {
              output = match[1];
              break;
            }
          }
        }
        error = '';
        needsInput = true;
      } else {
        error = `Runtime Error:\n${run.stderr}`;
      }
    } else if (hasOutput) {
      output = run.stdout;
    } else if (isSuccess) {
      // If successful but no output and we're in interactive mode, might be waiting for input
      output = '';
      // Don't set needsInput here - let executionService determine it
    } else {
      error = `Program exited with code ${run.code}`;
    }

    return {
      success: isSuccess && !hasError,
      output: output.trim(),
      error: error.trim(),
      time: run.output ? 'N/A' : (run.timeout ? 'Timeout' : '0'),
      memory: 'N/A', // Piston doesn't provide memory info in standard response
      status: isSuccess ? 'Accepted' : 'Error',
      needsInput: hasError && run.stderr.toLowerCase().includes('eof')
    };
  }

  /**
   * Check if Piston API is available
   * @returns {Promise<boolean>} API availability status
   */
  async checkApiHealth() {
    try {
      // Try to get available runtimes - Piston v3 uses /api/v2/runtimes
      const response = await fetch(`${this.baseUrl}/runtimes`);
      return response.ok;
    } catch (error) {
      console.error('Piston API health check failed:', error);
      return false;
    }
  }

  /**
   * Get available languages/runtimes from Piston
   * @returns {Promise<Array>} List of available runtimes
   */
  async getAvailableRuntimes() {
    try {
      const response = await fetch(`${this.baseUrl}/runtimes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching Piston runtimes:', error);
      return [];
    }
  }
}

// Create and export singleton instance
const pistonService = new PistonService();
console.log('✅ PistonService instance created:', pistonService);
export default pistonService;

