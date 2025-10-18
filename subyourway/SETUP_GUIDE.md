# 🚀 Quick Setup Guide

Follow these steps to get the Singlish Video Dubber up and running!

## Step 1: Install Node.js Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, and API clients.

## Step 2: Setup Python Backend

The Python backend is needed for Demucs audio separation.

### On macOS/Linux:

```bash
cd python_backend
chmod +x setup.sh
./setup.sh
cd ..
```

### On Windows:

```bash
cd python_backend
setup.bat
cd ..
```

**Note:** This will download ~2GB of AI models on first run. Be patient!

## Step 3: Install FFmpeg

FFmpeg is required for audio/video processing.

### macOS:
```bash
brew install ffmpeg
```

### Windows:
1. Download from https://ffmpeg.org/download.html
2. Or use Chocolatey: `choco install ffmpeg`

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

## Step 4: Get API Keys

### OpenAI (Whisper)
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Google Gemini
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the key

### ElevenLabs
1. Go to https://elevenlabs.io/
2. Sign up for an account
3. Navigate to Settings: https://elevenlabs.io/app/settings
4. Copy your API key
5. (Optional) Browse voices at https://elevenlabs.io/app/voice-library and copy a voice ID

## Step 5: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your API keys:

```env
OPENAI_API_KEY=sk-your-actual-key-here
GEMINI_API_KEY=your-actual-key-here
ELEVENLABS_API_KEY=your-actual-key-here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

## Step 6: Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## 🎉 You're Ready!

1. Upload a video (MP4, MOV, etc.)
2. Wait for processing (5-15 minutes)
3. Download your Singlish-dubbed video!

## ⚠️ Common Issues

### Python not found
- Make sure Python 3.9+ is installed: `python --version` or `python3 --version`

### FFmpeg not found
- Ensure FFmpeg is in your PATH
- Restart your terminal after installation
- Test with: `ffmpeg -version`

### Demucs installation fails
- Try installing PyTorch separately first:
  ```bash
  pip install torch torchaudio
  pip install demucs
  ```

### TorchCodec error during audio separation
- Install soundfile:
  ```bash
  cd python_backend
  venv\Scripts\Activate.ps1  # Windows
  # or: source venv/bin/activate  # Mac/Linux
  pip install soundfile
  ```

### API errors
- Double-check your API keys in `.env.local`
- Make sure there are no extra spaces or quotes
- Verify keys are valid at each provider's website

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## 💡 Tips

- Start with short videos (< 2 minutes) to test
- Ensure stable internet connection for API calls
- First run will be slower due to model downloads
- Check the console for detailed error messages

## 🆘 Need Help?

If you encounter issues:
1. Check the error message in the console
2. Review the troubleshooting section in README.md
3. Open a GitHub issue with details

Happy dubbing! 🎬🇸🇬

