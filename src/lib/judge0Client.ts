/**
 * Judge0 API Client
 * 
 * This module provides a clean abstraction for interacting with the Judge0 Cloud API.
 * Direct API calls to RapidAPI (no backend proxy needed).
 * 
 * Configuration:
 * - Set VITE_JUDGE0_BASE_URL in frontend .env file to change the Judge0 server URL
 * - Set VITE_JUDGE0_API_KEY in frontend .env file for your RapidAPI key
 * - Default: https://judge0-ce.p.rapidapi.com
 */

// Direct API calls to Judge0 Cloud API
// Supports both official Judge0.com API and RapidAPI
const API_BASE_URL = import.meta.env.VITE_JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || '19f8daca8bmsh49e9297b91cd1d9p175e6ejsn7a74554fd6a2';
const USE_RAPIDAPI = import.meta.env.VITE_JUDGE0_USE_RAPIDAPI !== 'false'; // Default true for backward compatibility

// Helper function to get headers based on API type
function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (USE_RAPIDAPI || API_BASE_URL.includes('rapidapi.com')) {
    // RapidAPI headers
    if (API_KEY) {
      headers['X-RapidAPI-Key'] = API_KEY;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }
  } else if (API_KEY && API_KEY.trim() !== '') {
    // Official Judge0.com API uses Authorization header (only if key provided)
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  // If no API key and not RapidAPI, use public endpoint (no auth headers)
  
  return headers;
}

// Types
export interface Language {
  id: number;
  name: string;
}

export interface SubmitPayload {
  language_id: number;
  source_code: string;
  stdin?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface Status {
  id: number;
  description: string;
}

export interface SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
  message: string | null;
}

export interface AboutInfo {
  version: string;
  [key: string]: any;
}

/**
 * Helper function to handle API errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorJson.detail || errorMessage;
      
      // Log full error for debugging
      if (errorJson.error || errorJson.message) {
        console.error('Judge0 API Error:', errorJson);
      }
    } catch {
      // If parsing fails, use the raw text or default message
      if (errorText) {
        errorMessage = errorText.substring(0, 500); // Limit error message length
        console.error('Judge0 API Error (non-JSON):', errorText.substring(0, 200));
      }
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Get all supported languages from Judge0
 */
export async function getLanguages(): Promise<Language[]> {
  try {
    // Direct API call - supports both official API and RapidAPI
    const response = await fetch(`${API_BASE_URL}/languages`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    
    const data = await handleResponse<Language[]>(response);
    console.log('Judge0 languages fetched:', data.length, 'languages');
    return data;
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw new Error(`Failed to fetch languages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test Judge0 API connection and configuration
 * This can help diagnose server-side issues
 */
export async function testJudge0Connection(): Promise<{ success: boolean; message: string }> {
  try {
    // Test 1: Check if API is reachable
    const aboutResponse = await fetch(`${API_BASE_URL}/about`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    
    if (!aboutResponse.ok) {
      return {
        success: false,
        message: `Judge0 API returned status ${aboutResponse.status}. Please check if the server is running.`
      };
    }
    
    const aboutData = await aboutResponse.json();
    console.log('Judge0 API Info:', aboutData);
    
    // Test 2: Try a simple submission
    const testCode = 'print("Hello, World!")';
    const testPayload = {
      source_code: testCode,
      language_id: 71, // Python
    };
    
    const queryParams = new URLSearchParams({
      base64_encoded: 'false',
      wait: 'false',
      fields: 'stdout,stderr,compile_output,status_id,status,language,time,memory,message'
    });
    
    const submitResponse = await fetch(`${API_BASE_URL}/submissions?${queryParams}`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(testPayload),
    });
    
    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      return {
        success: false,
        message: `Failed to create test submission: ${errorText}`
      };
    }
    
    const submitData = await submitResponse.json();
    console.log('Test submission created:', submitData);
    
    // Wait a bit and check result
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const resultResponse = await fetch(`${API_BASE_URL}/submissions/${submitData.token}?${queryParams}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    
    const resultData = await resultResponse.json();
    console.log('Test submission result:', resultData);
    
    if (resultData.status.id === 13) {
      return {
        success: false,
        message: `Judge0 server error: ${resultData.message || 'Internal Error'}. This is a server-side configuration issue.`
      };
    }
    
    return {
      success: true,
      message: 'Judge0 API is working correctly!'
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Preprocess Java code to fix class name issues
 * Judge0 compiles Java as Main.java, so public classes must be named Main
 * or we need to remove the 'public' keyword
 */
function preprocessJavaCode(sourceCode: string): string {
  // Java language ID is 62
  // Judge0 compiles Java as Main.java, so we need to handle class names
  
  // Check if code has a public class that's not named Main
  const publicClassRegex = /public\s+class\s+(\w+)/;
  const match = sourceCode.match(publicClassRegex);
  
  if (match && match[1] !== 'Main') {
    // Remove 'public' keyword (simpler, preserves class name)
    // This allows any class name to work
    console.log(`Java preprocessing: Removing 'public' from class ${match[1]}`);
    return sourceCode.replace(/public\s+class\s+(\w+)/, 'class $1');
  }
  
  // Also check for non-public classes that aren't Main
  // If there's a class declaration that's not Main, we might need to rename it
  // But for now, non-public classes should work fine
  const classRegex = /^\s*(?:public\s+)?class\s+(\w+)/m;
  const classMatch = sourceCode.match(classRegex);
  if (classMatch && classMatch[1] !== 'Main') {
    console.log(`Java preprocessing: Found class ${classMatch[1]} (not Main, but should be OK if not public)`);
  }
  
  return sourceCode;
}

/**
 * Submit code for execution
 * @param payload - Submission payload with language_id, source_code, and optional stdin
 * @returns Token for tracking the submission
 */
export async function submitCode(payload: SubmitPayload): Promise<SubmissionResult> {
  try {
    // Validate required fields
    if (!payload.source_code || !payload.language_id) {
      throw new Error('source_code and language_id are required');
    }

    // Prepare the request body - matching the working example format
    // Ensure source_code is properly formatted (trim and ensure it's a string)
    let sourceCode = String(payload.source_code).trim();
    if (!sourceCode) {
      throw new Error('source_code cannot be empty');
    }
    
    // Preprocess Java code to fix class name issues
    // Judge0 compiles Java as Main.java, so we need to handle public class names
    if (payload.language_id === 62) { // Java language ID
      sourceCode = preprocessJavaCode(sourceCode);
    }
    
    const requestBody: any = {
      source_code: sourceCode, // Use preprocessed code
      language_id: Number(payload.language_id),
      // REQUIRED for Windows Docker Desktop (based on working example)
      enable_per_process_and_thread_time_limit: true,
      enable_per_process_and_thread_memory_limit: true,
    };
    
    // Add stdin if provided (even if empty string, pass it)
    if (payload.stdin !== undefined && payload.stdin !== null) {
      requestBody.stdin = String(payload.stdin);
    }
    
    // Add optional fields
    if (payload.cpu_time_limit) {
      requestBody.cpu_time_limit = payload.cpu_time_limit;
    }
    if (payload.memory_limit) {
      requestBody.memory_limit = payload.memory_limit;
    }

    // Direct API call to RapidAPI with wait=true for immediate results
    const queryParams = new URLSearchParams({
      base64_encoded: 'false',
      wait: 'true',
      fields: 'stdout,stderr,compile_output,status_id,status,language,time,memory,message'
    });
    
    const url = `${API_BASE_URL}/submissions?${queryParams}`;
    
    // Debug logging
    console.log('Submitting to Judge0:', {
      url,
      language_id: requestBody.language_id,
      source_code_length: sourceCode.length,
      source_code_preview: sourceCode.substring(0, 100) + (sourceCode.length > 100 ? '...' : ''),
      has_stdin: requestBody.stdin !== undefined,
      stdin_length: requestBody.stdin?.length || 0,
      stdin_preview: requestBody.stdin ? (requestBody.stdin.length > 50 ? requestBody.stdin.substring(0, 50) + '...' : requestBody.stdin) : null,
      stdin_has_newlines: requestBody.stdin?.includes('\n') || false,
      memory_limit: requestBody.memory_limit || 'default',
      cpu_time_limit: requestBody.cpu_time_limit || 'default'
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    });
    
    // When wait=true, we get the full result directly
    const data = await handleResponse<SubmissionResult>(response);
    
    // Log full error details for debugging
    if (data.status.id === 6) { // Compilation Error
      console.error('Compilation Error Details:', {
        compile_output: data.compile_output,
        message: data.message,
        stderr: data.stderr,
        full_result: data
      });
    }
    
    console.log('Judge0 submission completed:', {
      status_id: data.status.id,
      status_description: data.status.description,
      has_stdout: !!data.stdout,
      has_stderr: !!data.stderr,
      has_compile_output: !!data.compile_output,
      compile_output_preview: data.compile_output ? data.compile_output.substring(0, 200) : null,
      message: data.message
    });
    return data;
  } catch (error) {
    console.error('Error submitting code:', error);
    console.error('Payload was:', payload);
    throw new Error(`Failed to submit code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get submission result by token
 * Polls the submission until it's complete (not In Queue or Processing)
 * @param token - Submission token
 * @param maxWaitTime - Maximum time to wait in milliseconds (default: 30000)
 * @returns Submission result
 */
export async function getSubmission(
  token: string,
  maxWaitTime: number = 30000
): Promise<SubmissionResult> {
  const startTime = Date.now();
  const pollInterval = 1000; // Poll every 1 second
  
  while (true) {
    // Check timeout
    if (Date.now() - startTime > maxWaitTime) {
      throw new Error('Execution timed out. Please try again.');
    }
    
    try {
      // Direct API call with query parameters
      const queryParams = new URLSearchParams({
        base64_encoded: 'false',
        wait: 'false',
        fields: 'stdout,stderr,compile_output,status_id,status,language,time,memory,message'
      });
      
      const response = await fetch(`${API_BASE_URL}/submissions/${token}?${queryParams}`, {
        method: 'GET',
        headers: getApiHeaders(),
      });
      
      const data = await handleResponse<SubmissionResult>(response);
      
      // Debug logging for submission status
      if (data.status.id === 1 || data.status.id === 2) {
        console.log('Submission still processing:', {
          status_id: data.status.id,
          status_description: data.status.description
        });
      } else {
        console.log('Submission complete:', {
          status_id: data.status.id,
          status_description: data.status.description,
          has_stdout: !!data.stdout,
          has_stderr: !!data.stderr,
          has_compile_output: !!data.compile_output,
          has_message: !!data.message
        });
        // Log full result for debugging
        if (data.message || data.stderr || data.compile_output) {
          console.log('Submission result details:', {
            message: data.message,
            stderr: data.stderr,
            compile_output: data.compile_output
          });
        }
      }
      
      // Check if submission is complete
      // Status IDs: 1 = In Queue, 2 = Processing
      // Any other status means it's complete
      if (data.status.id !== 1 && data.status.id !== 2) {
        return data;
      }
      
      // Still processing, wait and poll again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      // If it's a timeout error, rethrow it
      if (error instanceof Error && error.message.includes('timed out')) {
        throw error;
      }
      
      console.error('Error fetching submission:', error);
      throw new Error(`Failed to fetch submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Get all status codes from Judge0
 */
export async function getStatuses(): Promise<Status[]> {
  try {
    // Direct API call - supports both official API and RapidAPI
    const response = await fetch(`${API_BASE_URL}/statuses`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    
    const data = await handleResponse<Status[]>(response);
    return data;
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw new Error(`Failed to fetch statuses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get API information (health check)
 */
export async function getAbout(): Promise<AboutInfo> {
  try {
    // Direct API call - supports both official API and RapidAPI
    const response = await fetch(`${API_BASE_URL}/about`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    
    const data = await handleResponse<AboutInfo>(response);
    return data;
  } catch (error) {
    console.error('Error fetching about info:', error);
    throw new Error(`Failed to fetch API info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

