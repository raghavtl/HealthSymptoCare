const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Log with colors
const log = {
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`)
};

// Main deployment function
async function deploy() {
  try {
    log.info('🚀 Starting deployment process...');
    
    // Step 1: Install dependencies
    log.info('📦 Installing dependencies...');
    execSync('npm run install-all', { stdio: 'inherit' });
    log.success('✅ Dependencies installed successfully!');
    
    // Step 2: Build the client
    log.info('🔨 Building client...');
    process.chdir(path.join(__dirname, 'src', 'client'));
    execSync('npm run build', { stdio: 'inherit' });
    log.success('✅ Client built successfully!');
    
    // Step 3: Check if .env file exists, create if not
    const envPath = path.join(__dirname, 'src', 'client', '.env');
    if (!fs.existsSync(envPath)) {
      log.warning('⚠️ No .env file found, creating from example...');
      const envExamplePath = path.join(__dirname, 'src', 'client', '.env.example');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        log.success('✅ Created .env file from example!');
      } else {
        log.error('❌ No .env.example file found!');
      }
    }
    
    // Step 4: Deploy to Netlify (if netlify-cli is installed)
    log.info('🌐 Deploying to Netlify...');
    try {
      execSync('npx netlify deploy --prod', { stdio: 'inherit' });
      log.success('✅ Deployed to Netlify successfully!');
    } catch (error) {
      log.warning('⚠️ Netlify deployment failed. You may need to install netlify-cli:');
      log.info('npm install -g netlify-cli');
      log.info('Then run: npx netlify deploy --prod');
    }
    
    log.success('🎉 Deployment process completed!');
    log.info('📝 Note: Make sure to set up your environment variables in your hosting platform.');
    
  } catch (error) {
    log.error(`❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the deployment
deploy();