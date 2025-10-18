#!/usr/bin/env node

/**
 * Setup verification script
 * Checks if all required dependencies and configurations are in place
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking Singlish Video Dubber Setup...\n');

let hasErrors = false;

// Check Node.js version
console.log('📦 Checking Node.js version...');
const nodeVersion = process.version;
const nodeMajorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (nodeMajorVersion >= 18) {
  console.log(`✅ Node.js ${nodeVersion} (OK)\n`);
} else {
  console.log(`❌ Node.js ${nodeVersion} (Need 18.0 or higher)\n`);
  hasErrors = true;
}

// Check if node_modules exists
console.log('📦 Checking Node.js dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('✅ Node modules installed\n');
} else {
  console.log('❌ Node modules not found. Run: npm install\n');
  hasErrors = true;
}

// Check Python
console.log('🐍 Checking Python...');
try {
  const pythonVersion = execSync('python3 --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ ${pythonVersion}\n`);
} catch (e) {
  try {
    const pythonVersion = execSync('python --version', { encoding: 'utf-8' }).trim();
    console.log(`✅ ${pythonVersion}\n`);
  } catch (e2) {
    console.log('❌ Python not found. Install Python 3.9+\n');
    hasErrors = true;
  }
}

// Check Python virtual environment
console.log('🐍 Checking Python virtual environment...');
const venvPath = path.join('python_backend', 'venv');
if (fs.existsSync(venvPath)) {
  console.log('✅ Python virtual environment exists\n');
} else {
  console.log('❌ Python virtual environment not found. Run: cd python_backend && python -m venv venv\n');
  hasErrors = true;
}

// Check FFmpeg
console.log('🎬 Checking FFmpeg...');
try {
  const ffmpegVersion = execSync('ffmpeg -version', { encoding: 'utf-8' }).split('\n')[0];
  console.log(`✅ ${ffmpegVersion}\n`);
} catch (e) {
  console.log('❌ FFmpeg not found. Install FFmpeg and add to PATH\n');
  hasErrors = true;
}

// Check .env file
console.log('🔑 Checking environment variables...');
if (fs.existsSync('.env.local') || fs.existsSync('.env')) {
  const envFile = fs.existsSync('.env.local') ? '.env.local' : '.env';
  const envContent = fs.readFileSync(envFile, 'utf-8');
  
  const hasOpenAI = envContent.includes('OPENAI_API_KEY=') && 
                    !envContent.includes('OPENAI_API_KEY=sk-your');
  const hasGemini = envContent.includes('GEMINI_API_KEY=') && 
                    !envContent.includes('GEMINI_API_KEY=your');
  const hasElevenLabs = envContent.includes('ELEVENLABS_API_KEY=') && 
                        !envContent.includes('ELEVENLABS_API_KEY=your');
  
  if (hasOpenAI) {
    console.log('✅ OpenAI API key configured');
  } else {
    console.log('⚠️  OpenAI API key not configured');
    hasErrors = true;
  }
  
  if (hasGemini) {
    console.log('✅ Gemini API key configured');
  } else {
    console.log('⚠️  Gemini API key not configured');
    hasErrors = true;
  }
  
  if (hasElevenLabs) {
    console.log('✅ ElevenLabs API key configured');
  } else {
    console.log('⚠️  ElevenLabs API key not configured');
    hasErrors = true;
  }
  console.log('');
} else {
  console.log('❌ .env.local or .env file not found. Copy .env.local.example to .env.local\n');
  hasErrors = true;
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
if (hasErrors) {
  console.log('❌ Setup incomplete. Please fix the issues above.');
  console.log('\nQuick fix commands:');
  console.log('  npm install                           # Install Node dependencies');
  console.log('  cd python_backend && ./setup.sh       # Setup Python (Mac/Linux)');
  console.log('  cd python_backend && setup.bat        # Setup Python (Windows)');
  console.log('  cp .env.local.example .env.local      # Create env file');
  console.log('\nSee SETUP_GUIDE.md for detailed instructions.');
  process.exit(1);
} else {
  console.log('✅ All checks passed! You\'re ready to go!');
  console.log('\nStart the application with:');
  console.log('  npm run dev');
  console.log('\nThen open http://localhost:3000 in your browser.');
  process.exit(0);
}

