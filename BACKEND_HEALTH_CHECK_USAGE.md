# Backend Health Check Usage

This document explains how to use the backend health check functionality.

## Backend URL

The default backend URL is set to: `http://49.204.168.41:3001`

You can override this by setting the `VITE_BACKEND_URL` environment variable.

## Usage Examples

### 1. Using BackendHealthService

```typescript
import { backendHealthService } from '@/services/backendHealthService';

// Check health status
async function checkBackendHealth() {
  try {
    const health = await backendHealthService.checkHealth();
    console.log('Backend Status:', health.status);
    console.log('Message:', health.message);
    console.log('Environment:', health.environment);
    console.log('Uptime:', health.uptime, 'seconds');
    console.log('yt-dlp Available:', health.ytDlpAvailable);
  } catch (error) {
    console.error('Backend is not available:', error);
  }
}

// Quick availability check
async function isBackendAvailable() {
  const available = await backendHealthService.isAvailable();
  if (available) {
    console.log('✅ Backend is available');
  } else {
    console.log('❌ Backend is not available');
  }
  return available;
}
```

### 2. Using VideoExtractionService

The `videoExtractionService` also has a health check method:

```typescript
import { videoExtractionService } from '@/services/videoExtractionService';

async function checkVideoServiceHealth() {
  try {
    const health = await videoExtractionService.checkHealth();
    console.log('Health:', health);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}
```

### 3. React Component Example

```tsx
import { useEffect, useState } from 'react';
import { backendHealthService } from '@/services/backendHealthService';
import type { BackendHealthResponse } from '@/services/backendHealthService';

export function BackendStatus() {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        setLoading(true);
        const healthData = await backendHealthService.checkHealth();
        setHealth(healthData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    // Optionally refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Checking backend status...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">Backend Status</h3>
      <p>Status: {health?.status}</p>
      <p>Message: {health?.message}</p>
      {health?.uptime && <p>Uptime: {health.uptime}s</p>}
      {health?.ytDlpAvailable !== undefined && (
        <p>yt-dlp: {health.ytDlpAvailable ? 'Available' : 'Not Available'}</p>
      )}
    </div>
  );
}
```

### 4. Command Line Testing

You can test the backend health endpoint using the provided test script:

```bash
# Use default URL (http://49.204.168.41:3001)
node test-backend-health.js

# Or specify a custom URL
node test-backend-health.js http://your-backend-url:3001
```

## API Response Format

The health endpoint returns the following JSON structure:

```json
{
  "status": "OK",
  "message": "Video extraction service is running",
  "environment": "development",
  "uptime": 1601,
  "ytDlpAvailable": false,
  "timestamp": "2025-11-23T15:51:55.088Z",
  "version": "1.0.0"
}
```

## Environment Variables

Create a `.env.local` file (or update your existing one) to customize the backend URL:

```env
VITE_BACKEND_URL=http://49.204.168.41:3001
```

## Error Handling

Both services will throw errors if:
- The backend is unreachable
- The response status is not 200
- Network errors occur

Always wrap health check calls in try-catch blocks:

```typescript
try {
  const health = await backendHealthService.checkHealth();
  // Handle success
} catch (error) {
  // Handle error - backend might be down
  console.error('Backend health check failed:', error);
}
```

