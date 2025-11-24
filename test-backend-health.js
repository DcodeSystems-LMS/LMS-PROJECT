#!/usr/bin/env node

/**
 * Test script to check backend health endpoint
 * Usage: node test-backend-health.js [backend-url]
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

// Default backend URL
const BACKEND_URL = process.argv[2] || 'http://49.204.168.41:3001';

async function checkHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BACKEND_URL}/api/health`);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    console.log(`\n🔍 Checking backend health at: ${BACKEND_URL}/api/health\n`);

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Backend-Health-Check/1.0'
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  try {
    const result = await checkHealth();

    if (result.statusCode === 200) {
      console.log('✅ Backend health check successful!\n');
      console.log('Response:', JSON.stringify(result.data, null, 2));
      
      if (result.data.status) {
        console.log(`\n📊 Status: ${result.data.status}`);
      }
      if (result.data.message) {
        console.log(`📝 Message: ${result.data.message}`);
      }
      if (result.data.environment) {
        console.log(`🌍 Environment: ${result.data.environment}`);
      }
      if (result.data.uptime !== undefined) {
        console.log(`⏱️  Uptime: ${result.data.uptime}s`);
      }
      if (result.data.ytDlpAvailable !== undefined) {
        console.log(`🎬 yt-dlp Available: ${result.data.ytDlpAvailable ? 'Yes' : 'No'}`);
      }
      if (result.data.version) {
        console.log(`📦 Version: ${result.data.version}`);
      }
      if (result.data.timestamp) {
        console.log(`🕐 Timestamp: ${result.data.timestamp}`);
      }
    } else {
      console.error(`❌ Health check failed with status: ${result.statusCode}`);
      console.error('Response:', result.data);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error checking backend health: ${error.message}`);
    process.exit(1);
  }
}

main();

