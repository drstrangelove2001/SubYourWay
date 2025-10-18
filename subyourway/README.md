# 🇸🇬 SubYourWay

**Context-aware, culture-localized subtitles**

Transform, not translate, your videos to Singlish. SubYourWay is a modern, AI-powered Next.js application that generates authentic Singaporean English subtitles with full cultural context understanding.

![SubYourWay](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Python](https://img.shields.io/badge/Python-3.9+-green)

## ✨ Features

- ⚡ **Fast Processing** - Generate subtitles in 2-3 minutes
- 🗣️ **Accurate Transcription** - OpenAI Whisper API transcribes speech with precise timestamps
- 🧠 **Context-Aware Translation** - Google Gemini AI understands meaning and cultural context
- 🇸🇬 **Authentic Singlish** - Natural local expressions and particles (lah, lor, meh, etc.)
- 🎬 **Embedded Subtitles** - Video with burned-in subtitles plus separate .srt files
- 💫 **Minimalistic UI** - Clean, dark interface with real-time progress tracking
- ⚡ **Automated Pipeline** - Fully automated end-to-end processing

## 🏗️ Architecture

### Processing Pipeline

```
1. Upload Video
   ↓
2. Extract Audio (FFmpeg)
   ↓
3. Transcribe Speech (OpenAI Whisper)
   ↓
4. Translate to Singlish (Google Gemini)
   ↓
5. Generate Subtitle Files (.srt)
   ↓
6. Embed Subtitles (FFmpeg)
   ↓
7. Download Result! 🎉
```

## 📋 Prerequisites

### System Requirements

- **Node.js** 18.0 or higher
- **Python** 3.9 or higher
- **FFmpeg** installed and accessible in PATH
- **Git** for cloning the repository

### API Keys Required

You'll need to obtain API keys from these services:

1. **OpenAI** - For Whisper transcription
   - Sign up at: https://platform.openai.com/
   - Get your API key from: https://platform.openai.com/api-keys

2. **Google Gemini** - For context-aware Singlish translation (uses gemini-1.5-flash model)
   - Get API key at: https://aistudio.google.com/app/apikey

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd pilot
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies (Optional)

Python dependencies are only needed if you plan to use the dubbing feature (not included in SubYourWay subtitle mode).

#### On macOS/Linux:
```bash
cd python_backend
chmod +x setup.sh
./setup.sh
cd ..
```

#### On Windows:
```bash
cd python_backend
setup.bat
cd ..
```

### 4. Install FFmpeg

#### macOS:
```bash
brew install ffmpeg
```

#### Windows:
Download from: https://ffmpeg.org/download.html
Or use Chocolatey:
```bash
choco install ffmpeg
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
```

### 5. Configure API Keys

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# OpenAI API Key for Whisper transcription
OPENAI_API_KEY=sk-your-openai-key-here

# Google Gemini API Key for context-aware translation
GEMINI_API_KEY=your-gemini-key-here
```

## 🎮 Usage

### Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using the Application

1. **Upload Video**
   - Drag and drop a video file or click to browse
   - Supported formats: MP4, MOV, AVI, MKV, WebM
   - Max file size: 500MB

2. **Wait for Processing**
   - The app will show real-time progress through each stage
   - Processing typically takes 2-3 minutes depending on video length
   - You can safely close the tab and return later

3. **Download Result**
   - Preview your video with embedded Singlish subtitles
   - Download the video file and separate .srt subtitle files

## 📁 Project Structure

```
pilot/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Main page component
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── VideoUploader.tsx    # Video upload component
│   └── ProcessingStatus.tsx # Progress tracker
├── lib/                     # Utility libraries
│   ├── ffmpeg.ts           # FFmpeg operations
│   ├── whisper.ts          # OpenAI Whisper integration
│   ├── gemini.ts           # Google Gemini integration
│   ├── elevenlabs.ts       # ElevenLabs integration
│   ├── python-runner.ts    # Python script executor
│   └── utils.ts            # Helper utilities
├── pages/api/              # API routes
│   ├── upload.ts          # Video upload endpoint
│   ├── process.ts         # Processing orchestration
│   ├── status.ts          # Status polling endpoint
│   └── download.ts        # Video download endpoint
├── python_backend/         # Python backend
│   ├── audio_separator.py # Demucs audio separation
│   ├── requirements.txt   # Python dependencies
│   ├── setup.sh          # Setup script (Unix)
│   └── setup.bat         # Setup script (Windows)
├── temp/                  # Temporary processing files
└── public/               # Static assets
```

## 🔧 Configuration

### Adjusting Subtitle Style

Edit `lib/subtitles.ts` to customize subtitle appearance:

```typescript
// Subtitle styling options
fontsize: 24,            // Font size
fontcolor: 'white',      // Text color
borderw: 2,              // Border width
bordercolor: 'black',    // Border color
```

## 🐛 Troubleshooting

### Python Virtual Environment Issues

If the Python setup fails:

```bash
cd python_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### FFmpeg Not Found

Ensure FFmpeg is in your system PATH:

```bash
ffmpeg -version
```

If not found, reinstall FFmpeg and restart your terminal.

### API Rate Limits

If you hit API rate limits:
- Wait a few minutes between requests
- Upgrade your API plan for higher limits

### Port Already in Use

If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

## 💰 Cost Estimates

Approximate costs per 5-minute video:

- **OpenAI Whisper**: ~$0.03 (5 min × $0.006/min)
- **Google Gemini**: ~$0.00 (Free tier: 60 requests/min)

**Total**: ~$0.03 per 5-minute video (essentially free with Gemini's free tier)

## 🚀 Production Deployment

### Environment Variables

Set all environment variables in your deployment platform.

### Persistent Storage

For production, replace the in-memory job status with:
- Redis for job queue and status
- S3 or cloud storage for video files
- PostgreSQL/MongoDB for job history

### Recommended Services

- **Vercel** - Next.js frontend (API routes have 10s timeout, not ideal for long processing)
- **Railway** / **Render** - Better for long-running processes
- **AWS Lambda** with SQS - For scalable video processing
- **Docker** - Containerize for consistent deployment

### Scaling Considerations

- Use a job queue (Bull, BullMQ) for processing
- Separate frontend from backend processing
- Use cloud storage for temporary files
- Implement webhooks for completion notifications

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- **OpenAI** - Whisper for accurate transcription
- **Google** - Gemini for context-aware translation
- **FFmpeg** - Audio/video processing and subtitle embedding

## 📧 Support

For issues and questions, please open a GitHub issue or contact the maintainer.

---

Made with ❤️ for Singapore 🇸🇬

Enjoy lah! If got any problem, just ask can already! 😄

