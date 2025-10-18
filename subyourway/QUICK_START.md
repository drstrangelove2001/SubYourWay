# ⚡ Quick Start - Get Running in 5 Minutes!

## Prerequisites Check

Before you start, make sure you have:
- [ ] Node.js 18+ installed
- [ ] FFmpeg installed
- [ ] API keys ready (OpenAI, Gemini)

Not sure? Run this to check:
```bash
node --version    # Should be v18.0.0 or higher
python3 --version # Should be 3.9.0 or higher
ffmpeg -version   # Should show FFmpeg info
```

## 5-Minute Setup

### Step 1: Install Node Dependencies (1 min)
```bash
npm install
```

### Step 2: Setup Python Backend (Optional - Skip for Subtitle Mode)
Python backend is only needed for dubbing features, not for subtitles.

**Skip this step if you only want to use SubYourWay for subtitles.**

### Step 3: Add API Keys (1 min)
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your keys:
```env
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-key-here
```

**Where to get API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Gemini: https://aistudio.google.com/app/apikey

### Step 4: Verify Setup (30 sec)
```bash
npm run check-setup
```

### Step 5: Start the App! (30 sec)
```bash
npm run dev
```

Open http://localhost:3000 🎉

## First Video

1. **Upload**: Drag a short video (< 2 min recommended for first try)
2. **Wait**: Processing takes 2-3 minutes
3. **Download**: Get your video with Singlish subtitles!

## Troubleshooting

### "Python not found" (Only needed for dubbing)
Install Python from https://python.org if you need dubbing features

### "FFmpeg not found"
- **Mac**: `brew install ffmpeg`
- **Windows**: https://ffmpeg.org/download.html
- **Linux**: `sudo apt install ffmpeg`

### "API key invalid"
Double-check:
- No extra spaces in `.env.local`
- Keys are copied completely
- Keys are active at provider's website

### "Port 3000 in use"
```bash
npm run dev -- -p 3001
```

### Still stuck?
See SETUP_GUIDE.md for detailed instructions!

## What's Next?

- Read README.md for full documentation
- Check PROJECT_SUMMARY.md to understand the architecture
- See CONTRIBUTING.md if you want to help improve the app

---

**Enjoy lah!** 🇸🇬 If got problem, just ask can already! 😄

