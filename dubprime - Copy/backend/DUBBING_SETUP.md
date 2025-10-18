# Video Dubbing Feature - Setup Guide

## Overview
The dubbing feature allows you to generate AI-dubbed videos from SRT subtitle files. The system:
1. Generates speech from SRT subtitles using ElevenLabs AI
2. Separates vocals from background music in the original video
3. Combines the new dubbed audio with the original background music
4. Merges everything back into a final dubbed video

## Prerequisites

### System Requirements
- Python 3.10+
- Node.js 18+
- FFmpeg (required for video processing)
- 8GB+ RAM recommended

### API Keys
You'll need an ElevenLabs API key. Get one at: https://elevenlabs.io

Create a `.env` file in the `backend/` directory:
```env
ELEVEN_LABS_API_KEY=your_key_here
OPENAI_API_KEY=your_openai_key_here
```

## Installation

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

**Important:** If you encounter NumPy version conflicts with Demucs:
```bash
pip install "numpy<2"
pip install --upgrade ml_dtypes
```

### FFmpeg Installation

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or using Scoop
scoop install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### Frontend Setup

```bash
cd ..
npm install
```

## Running the Application

### Start Backend
```bash
cd backend
python app.py
```
The API will be available at http://localhost:3001

### Start Frontend
```bash
# In the project root
npm run dev
```
The app will be available at http://localhost:5173

## Using the Dubbing Feature

1. **Navigate to the app** and click on the "🎙️ Video Dubbing" tab
2. **Upload your video** (MP4, MOV, etc.)
3. **Upload your SRT file** with the desired subtitles/script
4. **Select a voice** from the dropdown (different accents, genders available)
5. **Click "Start Dubbing"**
6. **Wait for processing** (typically 5-10 minutes depending on video length)
   - Progress bar shows real-time status
   - Steps: Audio generation → Audio separation → Combining → Merging
7. **Download your dubbed video** when complete!

## API Endpoints

### POST /api/dub
Start a new dubbing job.

**Request:**
- `video`: Video file (multipart/form-data)
- `srt`: SRT subtitle file (multipart/form-data)
- `voiceId`: ElevenLabs voice ID (optional, defaults to George)

**Response:**
```json
{
  "jobId": "uuid-here",
  "message": "Dubbing job started",
  "status": "processing"
}
```

### GET /api/dub/progress/:jobId
Get the progress of a dubbing job.

**Response:**
```json
{
  "jobId": "uuid-here",
  "status": "generating_audio",
  "progress": 45,
  "message": "Generating audio 23/50..."
}
```

### GET /api/dub/download/:jobId
Download the completed dubbed video.

## Available Voices

| Voice ID | Name | Description |
|----------|------|-------------|
| `JBFqnCBsd6RMkjVDRZzb` | George | Male, Deep |
| `pNInz6obpgDQGcFmaJgB` | Adam | Male, American |
| `EXAVITQu4vr4xnSDxMaL` | Sarah | Female, Soft |
| `MF3mGyEYCl7XYWbV9V6O` | Elli | Female, Young |
| `mbL34QDB5FptPamlgvX5` | Bill | Male, Documentary |

## Troubleshooting

### NumPy Version Conflict
```bash
pip install "numpy<2"
pip install --upgrade ml_dtypes
```

### Demucs Installation Issues
If Demucs fails to install or run:
```bash
pip uninstall demucs
pip install demucs
```

### FFmpeg Not Found
Make sure FFmpeg is in your system PATH:
```bash
ffmpeg -version
```

### ElevenLabs API Errors
- Check your API key is valid
- Verify you have credits remaining in your ElevenLabs account
- Check the API rate limits

### Out of Memory
For long videos, the process can be memory-intensive. Try:
- Closing other applications
- Using a shorter video clip for testing
- Increasing system swap/page file

## Audio Quality Settings

The default audio mixing levels are:
- **Dubbed voice:** 120% volume (clear, prominent)
- **Background music:** 40% volume (subtle, background)

To adjust these, edit `backend/dub_routes.py` line ~213:
```python
'[0:a]volume=1.2[a1];[1:a]volume=0.4[a2];...'
#         ^^^              ^^^
#     Voice level    Background level
```

## Processing Time

Typical processing times:
- 1-minute video: ~3-5 minutes
- 5-minute video: ~8-15 minutes
- 10-minute video: ~15-30 minutes

Steps breakdown:
- Audio generation: 40% of time
- Audio separation: 30% of time
- Combining/merging: 30% of time

## File Storage

- **Uploads:** `backend/uploads/{jobId}/`
- **Outputs:** `backend/outputs/{jobId}/`
- **Separated audio:** `backend/separated/htdemucs/{video_name}/`
- **Temp files:** `backend/temp_dubbing/{jobId}/`

## Support

For issues or questions:
1. Check the console logs (both frontend and backend)
2. Verify all dependencies are installed
3. Test with a short video first
4. Check API keys are valid

## Credits

- Speech synthesis: [ElevenLabs](https://elevenlabs.io)
- Audio separation: [Demucs](https://github.com/facebookresearch/demucs)
- Video processing: [FFmpeg](https://ffmpeg.org)

