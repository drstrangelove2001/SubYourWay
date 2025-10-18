# Quick Start Guide - Audio Removal

Get up and running with the audio removal tool in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd backend/video-analysis
pip install -r requirements.txt
```

### 2. Test the Tool

```bash
# Run tests (no video processing)
python test_audio_removal.py

# Test with actual video (requires a test video at clips/scene.mp4)
python remove_audio.py clips/scene.mp4 --method ffmpeg --info
```

## 📖 Common Use Cases

### Use Case 1: Extract Audio and Create Silent Video

```bash
python remove_audio.py input.mp4
```

**Output:** 
- `input_no_audio.mp4` - Silent video
- `input_audio.mp3` - Extracted audio

### Use Case 2: Batch Process Videos

```bash
python batch_remove_audio.py videos/ --method ffmpeg
```

**Output:** All processed videos in `videos/no_audio/`

### Use Case 3: Using in Python Code

```python
from remove_audio import AudioRemover

remover = AudioRemover("video.mp4", method="ffmpeg")
if remover.remove_audio():
    print(f"Video: {remover.output_path}")
    print(f"Audio: {remover.audio_path}")
```

### Use Case 4: Run as API Server

```bash
# Install Flask
pip install flask flask-cors

# Start server
python audio_api.py
```

Then open `api_client_example.html` in your browser to test!

## 🛠️ Installation Options

### Option A: moviepy (Python Only)

**Pros:** Easy installation, Python-only
**Cons:** Slower, may reduce video quality

```bash
pip install moviepy
```

### Option B: FFmpeg (Recommended)

**Pros:** Fast, preserves quality, no re-encoding
**Cons:** Requires separate installation

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

**Verify Installation:**
```bash
ffmpeg -version
```

## 🔧 Configuration

### Method Selection

Choose between `moviepy` or `ffmpeg`:

```bash
# FFmpeg (fast, recommended)
python remove_audio.py video.mp4 --method ffmpeg

# moviepy (slower, but Python-only)
python remove_audio.py video.mp4 --method moviepy
```

### Custom Output Path

```bash
python remove_audio.py input.mp4 --output silent_video.mp4
```

### Show File Information

```bash
python remove_audio.py video.mp4 --method ffmpeg --info
```

## 📊 Performance Comparison

| Method | Speed | Quality | File Size | Installation |
|--------|-------|---------|-----------|--------------|
| FFmpeg | ⚡⚡⚡⚡⚡ | Same as original | Same as original | Requires FFmpeg |
| moviepy | ⚡⚡ | May be reduced | Usually larger | Python only |

**Recommendation:** Use FFmpeg for production, moviepy for quick testing

## 🎯 Integration Examples

### Example 1: Pre-process Before Dubbing

```python
from remove_audio import AudioRemover

# 1. Remove original audio
remover = AudioRemover("original.mp4", method="ffmpeg")
remover.remove_audio()

# 2. Add your dubbing/subtitles to the silent video
silent_video = str(remover.output_path)
# ... your dubbing logic here
```

### Example 2: Batch Process Directory

```python
from batch_remove_audio import process_batch

results = process_batch(
    input_dir="uploads/",
    output_dir="processed/",
    method="ffmpeg"
)

print(f"Processed {results['success']}/{results['total']} videos")
```

### Example 3: Web API Integration

```python
# Start API server
# python audio_api.py

# Then use from JavaScript:
const formData = new FormData();
formData.append('file', videoFile);
formData.append('method', 'ffmpeg');

const response = await fetch('http://localhost:5000/api/remove-audio', {
    method: 'POST',
    body: formData
});

const result = await response.json();
console.log('Output:', result.download_url);
```

## 🐛 Troubleshooting

### Issue: "moviepy not found"
```bash
pip install moviepy
```

### Issue: "FFmpeg not found"
1. Install FFmpeg (see installation section above)
2. Verify with: `ffmpeg -version`
3. Make sure it's in your system PATH

### Issue: "Video has no audio"
The tool will detect and notify you if the video already has no audio track.

### Issue: "Permission denied"
Ensure you have write permissions in the output directory.

### Issue: "File not found"
Check that the video path is correct:
```bash
# Use absolute path if needed
python remove_audio.py "C:/Users/username/Videos/video.mp4"
```

## 📝 API Endpoints (when using audio_api.py)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/remove-audio` | Remove audio from video |
| GET | `/api/download/<file>` | Download processed video |
| GET | `/api/files` | List all processed files |
| DELETE | `/api/files/<file>` | Delete processed file |

## 💡 Tips

1. **Use FFmpeg for production** - Much faster and better quality
2. **Process videos in batches** - Use `batch_remove_audio.py` for multiple files
3. **Check file sizes** - Use `--info` flag to see size reduction
4. **Clean up outputs** - Processed files are saved permanently, clean up when done
5. **Test first** - Run `test_audio_removal.py` before processing important videos

## 🎓 Learning Path

1. **Start Simple:** `python remove_audio.py video.mp4`
2. **Try FFmpeg:** `python remove_audio.py video.mp4 --method ffmpeg`
3. **Batch Process:** `python batch_remove_audio.py videos/`
4. **Python Integration:** Use AudioRemover class in your code
5. **API Server:** Run `audio_api.py` for web integration

## 📚 Next Steps

- Read full documentation: `AUDIO_REMOVAL_README.md`
- Check examples: `example_usage.py`
- Run tests: `test_audio_removal.py`
- Try API: `python audio_api.py` + open `api_client_example.html`

## 🤝 Support

Having issues? Check:
1. All dependencies are installed
2. FFmpeg is in PATH (if using FFmpeg method)
3. Video file exists and is readable
4. You have write permissions in output directory

## ⚡ Quick Commands Reference

```bash
# Basic usage (extracts audio as MP3)
python remove_audio.py video.mp4

# Fast method (FFmpeg) - recommended
python remove_audio.py video.mp4 --method ffmpeg

# Extract audio as WAV
python remove_audio.py video.mp4 --audio-format wav

# Don't save audio (old behavior)
python remove_audio.py video.mp4 --no-save-audio

# Custom output
python remove_audio.py input.mp4 --output output.mp4

# Show file info
python remove_audio.py video.mp4 --info

# Batch process with audio extraction
python batch_remove_audio.py videos/ --audio-format mp3

# Run API server
python audio_api.py

# Run tests
python test_audio_removal.py
python test_audio_extraction.py  # NEW!
```

---

**Ready to start?** Choose your method and run the commands above! 🚀

