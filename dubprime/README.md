# DubPrime - Intelligent Video Dubbing Platform

A sleek, dark-themed frontend platform for adding AI-powered, context-aware subtitles and dub to videos.

## Features

- 🎥 **Drag & Drop Video Upload** - Easy video file upload with drag-and-drop support
- 🎬 **Video Player** - Custom video player with subtitle overlay display
- ✏️ **Subtitle Editor** - Timeline-based subtitle editor with real-time preview
- 🌍 **Cultural Context** - Configure cultural context and language settings
- 🗣️ **Speaker Detection** - Identify and differentiate between speakers
- 🎨 **Tone Adaptation** - Adjust subtitle tone and style (formal, casual, humorous, etc.)
- 📥 **Export Options** - Download subtitles in SRT, VTT formats or burn into video

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## Project Structure

```
dubprime/
├── src/                        # Frontend React application
│   ├── components/
│   │   ├── Header.jsx          # App header with branding
│   │   ├── VideoUpload.jsx     # Video upload interface
│   │   ├── VideoPlayer.jsx     # Video player with controls
│   │   ├── SubtitleEditor.jsx  # Subtitle timeline editor
│   │   └── ContextPanel.jsx    # AI settings and context panel
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── backend/                    # Backend services
│   └── video-analysis/         # AI video analysis engine
│       ├── geminicontextor/    # Core analysis package
│       ├── prompts/             # Analysis prompt templates
│       ├── quota_aware_test.py  # Production analysis script
│       ├── enhanced_test.py     # Advanced analysis features
│       └── requirements.txt     # Python dependencies
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🧠 AI Backend Integration

**NEW**: DubPrime now includes a powerful video analysis backend powered by Google Gemini AI!

### Video Analysis Engine

Located in `backend/video-analysis/`, this engine provides:

- **🎬 Scene Understanding**: Analyzes video frames to understand atmosphere, setting, and context
- **😊 Emotional Analysis**: Detects mood, emotions, and interpersonal dynamics
- **👥 Character Detection**: Identifies speakers and their roles in scenes
- **🌍 Cultural Context**: Analyzes visual elements for cultural adaptation
- **⚡ Real-time Processing**: Fast analysis with quota-aware retry logic
- **🔇 Audio Removal**: Remove audio tracks from videos programmatically

### Backend Setup

```bash
# Navigate to backend
cd backend/video-analysis

# Install Python dependencies
pip install -r requirements.txt

# Set up Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Test video analysis
python quota_aware_test.py --video "sample.mp4" --fps 0.1
```

### Integration Features

- **Context-Aware Dubbing**: Uses scene analysis for appropriate translation style
- **Emotional Tone Matching**: Adjusts subtitle tone based on detected emotions
- **Cultural Adaptation**: Adapts content for different cultural contexts
- **Speaker Identification**: Differentiates between multiple speakers
- **Timing Optimization**: Uses scene changes to optimize subtitle timing

### Audio Removal & Extraction Tool

**NEW!** Extract and save audio from videos - perfect for preparing videos for dubbing:

```bash
# Extract audio as MP3 + create silent video
python remove_audio.py input.mp4 --method ffmpeg

# Extract audio as WAV (lossless)
python remove_audio.py input.mp4 --audio-format wav

# Batch process with audio extraction
python batch_remove_audio.py videos/ --method ffmpeg --audio-format mp3

# Just remove audio (don't save it)
python remove_audio.py input.mp4 --no-save-audio
```

**Features:**
- 🎵 **Audio Extraction**: Saves audio separately (MP3, WAV, AAC, M4A, FLAC, OGG)
- 🎬 **Silent Videos**: Creates video without audio
- ⚡ **Two methods**: moviepy (Python) or FFmpeg (faster)
- 📦 **Batch processing**: Process multiple videos at once
- 🔄 **Automatic naming**: Smart file naming
- 📊 **File statistics**: Size comparison and info

**Output:** For `video.mp4`, you get:
- `video_no_audio.mp4` - Silent video
- `video_audio.mp3` - Extracted audio

See `backend/video-analysis/AUDIO_EXTRACTION_UPDATE.md` for the new audio extraction feature!

## Design Philosophy

- **Dark Theme** - Easy on the eyes for long editing sessions
- **Modern UI** - Sleek, professional interface with smooth animations
- **Responsive** - Works seamlessly on desktop and tablet devices
- **Intuitive** - User-friendly workflow from upload to export

## License

MIT

