# 🎙️ Video Dubbing - Quick Start Guide

Transform any video with AI-powered dubbing! Upload a video + SRT file, select a voice, and get a fully dubbed video.

## ⚡ Quick Setup (5 minutes)

### 1. Get Your API Key
Sign up at [ElevenLabs](https://elevenlabs.io) and get your API key.

### 2. Configure Environment
Create `backend/.env`:
```env
ELEVEN_LABS_API_KEY=your_elevenlabs_key_here
```

### 3. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

**FFmpeg** (if not already installed):
- Windows: `choco install ffmpeg`
- macOS: `brew install ffmpeg`
- Linux: `sudo apt install ffmpeg`

### 4. Start the App

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Use the App

1. Open http://localhost:5173
2. Click "🎙️ Video Dubbing" tab
3. Upload video + SRT file
4. Select voice
5. Click "Start Dubbing"
6. Wait 5-10 minutes
7. Download your dubbed video!

## 🎯 What It Does

```
Your Video + SRT File
         ↓
   [AI Processing]
         ↓
1. Separates vocals from background music (Demucs)
2. Generates new AI voice from SRT (ElevenLabs)
3. Combines new voice + background music
4. Merges into final video (FFmpeg)
         ↓
   Dubbed Video! 🎬
```

## 🔧 Troubleshooting

**NumPy Error?**
```bash
pip install "numpy<2" --force-reinstall
pip install --upgrade ml_dtypes
```

**FFmpeg Not Found?**
```bash
ffmpeg -version  # Check if installed
```

**ElevenLabs API Error?**
- Verify API key in `.env`
- Check you have credits at elevenlabs.io

## 📚 Full Documentation

See [backend/DUBBING_SETUP.md](backend/DUBBING_SETUP.md) for detailed documentation.

## 💡 Example Workflow

**Scenario:** You have a video in English and want it dubbed in Singlish.

1. Generate SRT file using the "📝 Subtitle Generation" tab
2. Edit/translate the subtitles to Singlish
3. Export the SRT file
4. Switch to "🎙️ Video Dubbing" tab
5. Upload the original video + your Singlish SRT
6. Select a voice that fits the content
7. Start dubbing
8. Get your Singlish-dubbed video!

## 🎤 Voice Options

- **George** - Male, Deep voice (great for narration)
- **Adam** - Male, American accent
- **Sarah** - Female, Soft voice
- **Elli** - Female, Young voice
- **Bill** - Male, Documentary style

## ⏱️ Processing Times

- **1 min video** → ~3-5 min processing
- **5 min video** → ~8-15 min processing
- **10 min video** → ~15-30 min processing

Progress bar shows real-time status!

---

**Ready to dub?** Start the app and head to the 🎙️ Video Dubbing tab!

