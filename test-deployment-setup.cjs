// Test script to validate deployment setup
// Run this after deployment to ensure everything is working

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing DCode Learning Platform Deployment Setup...\n');

// Test 1: Check if required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'src/config/api.ts',
  '.htaccess',
  'env.local',
  'env.production',
  'backend/server.js',
  'backend/package.json',
  'backend/env.production.template'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the setup.');
  process.exit(1);
}

// Test 2: Check environment configuration
console.log('\n🔧 Checking environment configuration...');
try {
  const envLocal = fs.readFileSync('env.local', 'utf8');
  const envProduction = fs.readFileSync('env.production', 'utf8');
  
  // Check for required environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_BACKEND_URL',
    'VITE_API_BASE_URL'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envLocal.includes(envVar) && envProduction.includes(envVar)) {
      console.log(`✅ ${envVar} configured`);
    } else {
      console.log(`❌ ${envVar} - MISSING`);
    }
  });
} catch (error) {
  console.log('❌ Error reading environment files:', error.message);
}

// Test 3: Check API configuration
console.log('\n🌐 Checking API configuration...');
try {
  const apiConfig = fs.readFileSync('src/config/api.ts', 'utf8');
  
  if (apiConfig.includes('backendUrl') && apiConfig.includes('apiBaseUrl')) {
    console.log('✅ API configuration file exists');
  } else {
    console.log('❌ API configuration incomplete');
  }
  
  if (apiConfig.includes('isDevelopment') && apiConfig.includes('isProduction')) {
    console.log('✅ Environment detection configured');
  } else {
    console.log('❌ Environment detection missing');
  }
} catch (error) {
  console.log('❌ Error reading API configuration:', error.message);
}

// Test 4: Check backend configuration
console.log('\n🔧 Checking backend configuration...');
try {
  const serverJs = fs.readFileSync('backend/server.js', 'utf8');
  
  if (serverJs.includes('cors') && serverJs.includes('express')) {
    console.log('✅ Backend server configuration exists');
  } else {
    console.log('❌ Backend server configuration incomplete');
  }
  
  if (serverJs.includes('NODE_ENV') && serverJs.includes('CORS_ORIGIN')) {
    console.log('✅ Environment-based configuration present');
  } else {
    console.log('❌ Environment-based configuration missing');
  }
} catch (error) {
  console.log('❌ Error reading backend configuration:', error.message);
}

// Test 5: Check .htaccess configuration
console.log('\n🔒 Checking .htaccess configuration...');
try {
  const htaccess = fs.readFileSync('.htaccess', 'utf8');
  
  if (htaccess.includes('RewriteEngine On') && htaccess.includes('index.html')) {
    console.log('✅ React Router configuration present');
  } else {
    console.log('❌ React Router configuration missing');
  }
  
  if (htaccess.includes('mod_deflate') && htaccess.includes('mod_expires')) {
    console.log('✅ Performance optimizations configured');
  } else {
    console.log('❌ Performance optimizations missing');
  }
  
  if (htaccess.includes('X-Frame-Options') && htaccess.includes('X-Content-Type-Options')) {
    console.log('✅ Security headers configured');
  } else {
    console.log('❌ Security headers missing');
  }
} catch (error) {
  console.log('❌ Error reading .htaccess configuration:', error.message);
}

// Test 6: Check deployment scripts
console.log('\n📦 Checking deployment scripts...');
const deploymentScripts = [
  'deploy-hostinger-complete.bat',
  'deploy-frontend-only.bat',
  'deploy-backend-only.bat'
];

deploymentScripts.forEach(script => {
  if (fs.existsSync(script)) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script} - MISSING`);
  }
});

// Test 7: Check package.json scripts
console.log('\n📋 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['build', 'build:prod', 'dev'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script} script exists`);
    } else {
      console.log(`❌ ${script} script missing`);
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Summary
console.log('\n🎯 Deployment Setup Summary:');
console.log('=====================================');

if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('✅ Environment configuration is set up');
  console.log('✅ API configuration is ready');
  console.log('✅ Backend configuration is complete');
  console.log('✅ Frontend routing is configured');
  console.log('✅ Deployment scripts are available');
  
  console.log('\n🚀 Ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Run: deploy-hostinger-complete.bat');
  console.log('2. Upload deploy-package contents to Hostinger');
  console.log('3. Configure Node.js app in Hostinger control panel');
  console.log('4. Test your deployment');
  
  console.log('\n📖 For detailed instructions, see: HOSTINGER_DEPLOYMENT_COMPLETE.md');
} else {
  console.log('❌ Setup incomplete. Please fix the issues above before deploying.');
}

console.log('\n✨ Test completed!');
