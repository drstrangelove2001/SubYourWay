# DubPrime Backend API

Unified Flask backend for AI-powered video dubbing and subtitle generation.

## Features

### **Core Capabilities**

- **🎙️ Video Transcription**: OpenAI Whisper API for accurate speech-to-text
  - Auto-chunking for videos >10 minutes (prevents sync drift)
  - Real-time progress updates with incremental subtitle delivery
  - Multi-language support with auto-detection

- **🌍 Subtitle Translation**: GPT-5 nano powered natural language translation
  - **Singapore English (Singlish) by default** - authentic local flavor with "lah", "lor", "sia"
  - Advanced slang, emotion, and humor capture (GPT-5 family)
  - Context-aware localization (not literal word-for-word)
  - Cultural adaptation for idioms and expressions
  - Tone customization (casual, formal, humorous, neutral)

- **🎬 Video Analysis** (Gemini AI):
  - Frame-by-frame scene analysis
  - Automatic cultural context extraction
  - Scene understanding for better subtitle accuracy

- **🎵 Audio Processing**:
  - Audio extraction from video
  - Audio removal (mute videos)
  - Audio separation (vocals/background) via Demucs

### **Advanced Features**

- Progress tracking with WebSocket-like polling
- Incremental subtitle updates for long videos
- Hallucination filtering for cleaner transcripts
- Batch processing support

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install flask>=3.0.0 flask-cors>=4.0.0 openai>=1.0.0 python-dotenv>=1.0.1 opencv-python>=4.7.0 numpy>=1.24.0 moviepy>=1.0.3 Pillow>=10.3.0 google-generativeai>=0.8.0 pandas>=2.0.0 werkzeug>=3.0.0
```

**Or install individually:**

```bash
# Flask web framework
pip install flask>=3.0.0 flask-cors>=4.0.0

# OpenAI for Whisper
pip install openai>=1.0.0

# Environment variables
pip install python-dotenv>=1.0.1

# Video/Audio processing
pip install opencv-python>=4.7.0 numpy>=1.24.0 moviepy>=1.0.3 Pillow>=10.3.0

# Google Gemini for translation and video analysis
pip install google-generativeai>=0.8.0

# Data processing
pip install pandas>=2.0.0

# Utilities
pip install werkzeug>=3.0.0
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install FFmpeg

FFmpeg is required for audio extraction. Install it:

**Windows (using Chocolatey):**
```bash
choco install ffmpeg
```

**Windows (using Scoop):**
```bash
scoop install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg  # Ubuntu/Debian
sudo yum install ffmpeg  # CentOS/RHEL
```

## Running the Server

```bash
python app.py
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/health
```

### Transcribe Video
```
POST /api/transcribe
Content-Type: multipart/form-data

Fields:
- video: Video file (required)
- targetLanguage: Target language code (optional, default: 'en')
- sourceLanguage: Source language code (optional, auto-detect)
- culturalContext: Cultural context for transcription (optional)
- tone: Desired tone (optional)

Response:
{
  "success": true,
  "subtitles": [...],
  "metadata": {
    "duration": 120.5,
    "language": "ja",
    "segmentCount": 45
  }
}
```

### Translate Subtitles
```
POST /api/translate
Content-Type: application/json

Body:
{
  "subtitles": [...],
  "targetLanguage": "en",
  "sourceLanguage": "ja",
  "culturalContext": "Japanese anime",
  "tone": "casual"
}

Response:
{
  "success": true,
  "subtitles": [...],
  "metadata": {
    "sourceLanguage": "ja",
    "targetLanguage": "en",
    "subtitleCount": 45
  }
}
```

## Project Structure

```
backend/
├── app.py                     # Main Flask application
├── whisper_routes.py          # Whisper transcription & translation
├── whisper_chunked.py         # Chunked processing for long videos
├── progress_tracker.py        # Real-time progress tracking
├── video_context.py           # Video analysis integration
├── hallucination_filter.py    # Whisper hallucination detection
├── .env                       # Environment variables (not in git)
├── .env.example              # Example environment variables
│
├── audio-extraction/          # Audio extraction & removal
│   ├── audio_api.py          # Flask API for audio operations
│   ├── remove_audio.py       # Audio removal utility
│   └── ...
│
├── audio-separation/          # Audio source separation
│   └── separate.py           # Demucs vocal/background separation
│
├── video-analysis/            # Gemini-powered video analysis
│   ├── analyze_video_complete.py  # Complete video analysis pipeline
│   ├── geminicontextor/      # Frame analysis module
│   └── ...
│
├── uploads/                   # Temporary uploads (auto-created)
└── outputs/                   # Processed outputs (auto-created)
```

## Development

To run in development mode with auto-reload:

```bash
export FLASK_ENV=development  # or set FLASK_ENV=development on Windows
python app.py
```

## Module Documentation

### Audio Extraction (`audio-extraction/`)
See [AUDIO_REMOVAL_README.md](audio-extraction/AUDIO_REMOVAL_README.md) for:
- Removing audio from videos
- Extracting audio to various formats
- Batch processing

### Audio Separation (`audio-separation/`)
Uses Demucs AI model to separate:
- Vocals from background music
- Clean dialogue extraction
- Background audio removal

### Video Analysis (`video-analysis/`)
Gemini-powered analysis:
- Frame-by-frame scene understanding
- Cultural context extraction
- Automatic scene summaries

## Notes

- **Maximum file size**: 500MB
- **Supported formats**: MP4, AVI, MOV, MKV, FLV, WMV, WEBM
- **Temporary files**: Automatically cleaned up after processing
- **API Keys Required**:
  - OpenAI (required for transcription and translation)
  - Gemini (optional, for video analysis only)

## Performance

- **Short videos (<10 min)**: ~30-60 seconds processing
- **Long videos (>10 min)**: Chunked processing, ~1 minute per 5-minute chunk
- **Translation** (GPT-5 nano): ~2-4 seconds for 100 subtitles (ultra-fast + 90% cache discount)
- **Video Analysis** (optional): Adds ~20-30 seconds
