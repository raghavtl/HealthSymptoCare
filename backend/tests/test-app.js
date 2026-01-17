const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

console.log('🧪 Testing Health Buddy Application...\n');

// Test 1: Check if server can start
console.log('1. Testing server startup...');
// Resolve server entry to support running this test from any cwd
const serverEntry = path.resolve(__dirname, '..', 'server.js');
const serverProcess = spawn('node', [serverEntry], { 
  stdio: 'pipe',
  env: { ...process.env, PORT: 5001 } // Use different port for testing
});

let serverReady = false;
let serverError = '';

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Server output:', output);
  if (output.includes('Server running on port')) {
    serverReady = true;
    console.log('✅ Server started successfully');
  }
});

serverProcess.stderr.on('data', (data) => {
  serverError += data.toString();
});

serverProcess.on('error', (error) => {
  console.log('❌ Server failed to start:', error.message);
});

// Test 2: Check API endpoints
setTimeout(async () => {
  if (serverReady) {
    console.log('\n2. Testing API endpoints...');
    
    try {
      // Test health endpoint
      const healthResponse = await axios.get('http://localhost:5001/api/health');
      console.log('✅ Health endpoint working:', healthResponse.data);
      
      // Test health tips endpoint
      const tipsResponse = await axios.get('http://localhost:5001/api/health-tips');
      console.log('✅ Health tips endpoint working:', tipsResponse.data.length, 'tips found');
      
      console.log('\n🎉 All tests passed! Application is ready for deployment.');
    } catch (error) {
      console.log('❌ API test failed:', error.message);
    } finally {
      serverProcess.kill();
      process.exit(0);
    }
  } else {
    console.log('❌ Server not ready, skipping API tests');
    console.log('Server error:', serverError);
    serverProcess.kill();
    process.exit(1);
  }
}, 3000);

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout reached');
  serverProcess.kill();
  process.exit(1);
}, 10000);

