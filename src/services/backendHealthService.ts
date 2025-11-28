/**
 * Backend Health Service
 * Provides utilities to check backend health status
 */

export interface BackendHealthResponse {
  status: string;
  message: string;
  environment?: string;
  uptime?: number;
  ytDlpAvailable?: boolean;
  timestamp?: string;
  version?: string;
}

class BackendHealthService {
  private getBackendUrlInternal(): string {
    return import.meta.env.VITE_BACKEND_URL || 'http://49.204.168.41:3001';
  }

  /**
   * Check backend health status
   * @returns Promise with health check response
   */
  async checkHealth(): Promise<BackendHealthResponse> {
    try {
      const backendUrl = this.getBackendUrlInternal();
      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }

      const data: BackendHealthResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking backend health:', error);
      throw error;
    }
  }

  /**
   * Check if backend is available
   * @returns Promise<boolean> - true if backend is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'OK';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get backend URL
   * @returns Backend URL string
   */
  getBackendUrl(): string {
    return this.getBackendUrlInternal();
  }
}

export const backendHealthService = new BackendHealthService();

