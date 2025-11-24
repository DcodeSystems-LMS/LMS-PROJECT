# Compilation Services for Multi-Language Platform

## Overview

This document provides recommendations for compilation and execution services that can support all kinds of programming languages in your platform.

---

## 🎯 Recommended Solutions

### 1. **Judge0 API** (Currently Used) ⭐

**Status**: ✅ Currently implemented

**Pros**:
- ✅ Supports 50+ programming languages
- ✅ Free public endpoint available (`https://ce.judge0.com`)
- ✅ Well-documented API
- ✅ Sandboxed execution environment
- ✅ Good error handling (compile-time and runtime)
- ✅ Time and memory limits
- ✅ Can be self-hosted for better control

**Cons**:
- ❌ Rate limits on free tier
- ❌ No true interactive execution (each submission is independent)
- ❌ Requires internet connection
- ❌ Public endpoint may have downtime

**Best For**:
- Quick implementation
- Educational platforms
- Code playgrounds
- Competitive programming platforms

**Self-Hosted Option**: ✅ Yes (Docker-based, open-source)

---

### 2. **Piston API** ⭐⭐⭐ (Highly Recommended)

**Why It's Great**:
- ✅ **Open-source and self-hostable**
- ✅ Supports 50+ languages
- ✅ Fast execution (Docker-based)
- ✅ No rate limits when self-hosted
- ✅ Simple REST API
- ✅ Good for production use
- ✅ Active development

**API Example**:
```javascript
POST https://emkc.org/api/v2/piston/execute

{
  "language": "python",
  "version": "3.10.0",
  "files": [{
    "content": "print('Hello, World!')"
  }],
  "stdin": ""
}
```

**Implementation**:
```javascript
// pistonService.js
class PistonService {
  constructor() {
    this.baseUrl = 'https://emkc.org/api/v2/piston'; // Public endpoint
    // Or self-hosted: 'http://your-server:2000/api/v2/piston'
  }

  async executeCode(sourceCode, language, input = '') {
    const languageMap = {
      'Python': 'python',
      'JavaScript': 'javascript',
      'C': 'c',
      'C++': 'cpp',
      'Java': 'java',
      'Go': 'go',
      // ... more languages
    };

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: languageMap[language] || language.toLowerCase(),
        version: '*', // Use latest version
        files: [{
          content: sourceCode
        }],
        stdin: input || ''
      })
    });

    const result = await response.json();
    return {
      success: result.run.code === 0,
      output: result.run.stdout || '',
      error: result.run.stderr || '',
      time: result.run.output ? 'N/A' : '0',
      memory: 'N/A'
    };
  }
}
```

**Self-Hosted Setup**:
```bash
# Docker deployment
docker run -d -p 2000:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston
```

**Best For**:
- Production applications
- Self-hosted solutions
- High-performance requirements
- Custom control needs

---

### 3. **JDoodle API**

**Pros**:
- ✅ Supports 70+ languages
- ✅ Free tier available
- ✅ Good API documentation
- ✅ Supports database connections (MySQL, MongoDB)
- ✅ Code sharing features

**Cons**:
- ❌ Rate limits on free tier
- ❌ Requires API key
- ❌ Not open-source
- ❌ Limited customization

**API Example**:
```javascript
POST https://api.jdoodle.com/v1/execute

{
  "script": "print('Hello, World!')",
  "language": "python3",
  "versionIndex": "3",
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET"
}
```

**Best For**:
- Quick integration
- Educational platforms
- When database support is needed

---

### 4. **Replit API** (Replit Code Execution API)

**Pros**:
- ✅ Supports 50+ languages
- ✅ Good documentation
- ✅ Real-time collaboration features
- ✅ Integrated terminal

**Cons**:
- ❌ Requires API key
- ❌ Rate limits
- ❌ More complex setup
- ❌ Not open-source

**Best For**:
- Educational platforms
- Collaborative coding features
- When Replit ecosystem integration is needed

---

### 5. **Self-Hosted Solutions**

#### A. **Piston** (Recommended for Self-Hosting)
- Open-source
- Docker-based
- Easy to deploy
- Good performance

#### B. **Judge0 CE** (Self-Hosted)
- Open-source
- Docker-based
- More features than public endpoint
- Better rate limits

#### C. **Custom Docker-Based Solution**
- Full control
- Custom language support
- No external dependencies
- Higher maintenance

---

## 📊 Comparison Table

| Service | Languages | Self-Host | Free Tier | Rate Limits | Best For |
|---------|-----------|-----------|-----------|-------------|----------|
| **Judge0** | 50+ | ✅ Yes | ✅ Yes | ⚠️ Limited | Quick setup |
| **Piston** | 50+ | ✅ Yes | ✅ Yes | ✅ None (self-host) | Production |
| **JDoodle** | 70+ | ❌ No | ✅ Yes | ⚠️ Limited | Education |
| **Replit** | 50+ | ❌ No | ⚠️ Limited | ⚠️ Limited | Collaboration |
| **Ideone** | 60+ | ❌ No | ✅ Yes | ⚠️ Limited | Simple use |

---

## 🚀 Recommended Implementation Strategy

### **Option 1: Hybrid Approach** (Best for Production)

Use **multiple services** with fallback:

1. **Primary**: Self-hosted Piston API (fast, no rate limits)
2. **Fallback 1**: Judge0 API (public endpoint)
3. **Fallback 2**: JDoodle API (if needed)

**Benefits**:
- High availability
- No single point of failure
- Cost-effective (self-hosted primary)
- Good performance

### **Option 2: Self-Hosted Piston** (Best for Control)

Deploy your own Piston instance:

**Benefits**:
- Full control
- No rate limits
- Better security
- Custom language versions
- No external dependencies

**Setup**:
```bash
# 1. Install Docker
# 2. Run Piston
docker run -d -p 2000:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston

# 3. Update your service
const pistonService = new PistonService('http://localhost:2000/api/v2/piston');
```

### **Option 3: Multi-Service Architecture**

Implement service abstraction layer:

```javascript
// executionServiceFactory.js
class ExecutionServiceFactory {
  constructor() {
    this.services = [
      new PistonService(),      // Primary
      new Judge0Service(),      // Fallback 1
      new JDoodleService(),     // Fallback 2
    ];
  }

  async executeCode(sourceCode, language, input) {
    for (const service of this.services) {
      try {
        const result = await service.executeCode(sourceCode, language, input);
        if (result.success || result.error) {
          return result;
        }
      } catch (error) {
        console.log(`Service ${service.constructor.name} failed, trying next...`);
        continue;
      }
    }
    throw new Error('All execution services failed');
  }
}
```

---

## 🛠️ Implementation Guide

### Step 1: Create Service Abstraction

```javascript
// services/baseExecutionService.js
class BaseExecutionService {
  async executeCode(sourceCode, language, input) {
    throw new Error('Must implement executeCode');
  }
  
  formatResult(result) {
    return {
      success: true,
      output: '',
      error: '',
      time: '0',
      memory: '0'
    };
  }
}
```

### Step 2: Implement Piston Service

```javascript
// services/pistonService.js
import BaseExecutionService from './baseExecutionService';

class PistonService extends BaseExecutionService {
  constructor(baseUrl = 'https://emkc.org/api/v2/piston') {
    super();
    this.baseUrl = baseUrl;
    this.languageMap = {
      'Python': 'python',
      'JavaScript': 'javascript',
      'C': 'c',
      'C++': 'cpp',
      'Java': 'java',
      'Go': 'go',
      'PHP': 'php',
      'Ruby': 'ruby',
      // ... more mappings
    };
  }

  async executeCode(sourceCode, language, input = '') {
    const pistonLanguage = this.languageMap[language] || language.toLowerCase();
    
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*',
        files: [{ content: sourceCode }],
        stdin: input || ''
      })
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status}`);
    }

    const result = await response.json();
    return this.formatResult(result);
  }

  formatResult(result) {
    return {
      success: result.run.code === 0,
      output: result.run.stdout || '',
      error: result.run.stderr || '',
      time: result.run.output ? 'N/A' : '0',
      memory: 'N/A'
    };
  }
}
```

### Step 3: Update Execution Service

```javascript
// services/executionService.js
import pistonService from './pistonService';
import judge0Service from './judge0Service';

class ExecutionService {
  async executeCode(sourceCode, language, input = '', isFirstRun = true) {
    // Try Piston first (if self-hosted)
    try {
      return await pistonService.executeCode(sourceCode, language, input);
    } catch (error) {
      console.log('Piston failed, trying Judge0...');
    }

    // Fallback to Judge0
    try {
      return await judge0Service.executeCodeInteractive(sourceCode, languageId, input);
    } catch (error) {
      throw new Error('All execution services failed');
    }
  }
}
```

---

## 🎯 Final Recommendations

### **For Development/Testing**:
- ✅ Keep current Judge0 implementation
- ✅ Add Piston as alternative

### **For Production**:
1. **Best**: Self-hosted Piston API
   - Full control
   - No rate limits
   - Better performance
   - Cost-effective

2. **Alternative**: Hybrid approach
   - Self-hosted Piston (primary)
   - Judge0 API (fallback)
   - JDoodle (backup)

### **For Maximum Reliability**:
- Implement multi-service architecture
- Automatic failover
- Health checks
- Load balancing

---

## 📝 Next Steps

1. **Evaluate Piston API**: Test with your use cases
2. **Consider Self-Hosting**: If you need better control
3. **Implement Service Abstraction**: For easy switching
4. **Add Health Checks**: Monitor service availability
5. **Implement Caching**: For frequently executed code

---

## 🔗 Resources

- **Piston**: https://github.com/engineer-man/piston
- **Judge0**: https://github.com/judge0/judge0
- **JDoodle API**: https://www.jdoodle.com/api-docs
- **Replit API**: https://docs.replit.com/

---

## Summary

**Current**: Judge0 API (working, but has limitations)

**Recommended**: 
- **Short-term**: Add Piston API as alternative/fallback
- **Long-term**: Self-host Piston API for production

**Best Architecture**: Multi-service with automatic failover for maximum reliability.

